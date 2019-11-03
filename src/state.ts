import { action, computed, observable, runInAction } from 'mobx';

import ApolloClient from 'apollo-boost';

import { BasicCharacterInfo, Equipment, PromotionLevel, Stat } from './common-types';
import Transport from './transport';
import { statCombineLinear } from './utils';

export class KnownEquipmentItem {
    @observable equipped: boolean = false;
    @observable enhanceLevel: number = 0;

    @computed get iconKey(): string {
        const id = this.data.id;
        return this.equipped ? `${id}` : `invalid/${id}`;
    }

    @computed get iconUrl(): string {
        const key = this.iconKey;
        const path = `/icons/equipment/${key}.png`;
        return new URL(path, STATIC_BASE_URL).toString();
    }

    get name(): string {
        return this.data.name;
    }

    @computed get maxEnhanceLevel(): number {
        const promotionLevel = this.data.promotionLevel;
        switch (promotionLevel) {
            case PromotionLevel.Blue: return 0;
            case PromotionLevel.Bronze: return 1;
            case PromotionLevel.Silver: return 3;
            case PromotionLevel.Gold:
            case PromotionLevel.Purple: return 5;
        }
    }

    @computed get stat(): Stat | null {
        if (!this.equipped) {
            return null;
        }
        return statCombineLinear([
            [this.data.stat, 1],
            [this.data.growthRate, this.enhanceLevel],
        ]);
    }

    constructor(public data: Equipment) {}

    @action.bound
    updateEnhanceLevel(enhanceLevel: number) {
        this.enhanceLevel = enhanceLevel;
    }

    @action.bound
    changeEquipState(equipped: boolean) {
        this.equipped = equipped;
    }

    @action.bound
    toggleEquipped() {
        this.equipped = !this.equipped;
    }
}

export class UnknownEquipmentItem {
    get data(): null {
        return null;
    }

    get equipped(): boolean {
        return true;
    }

    get enhanceLevel(): number {
        return 0;
    }

    get iconKey(): string {
        return '999999';
    }

    get iconUrl(): string {
        const path = '/icons/equipment/999999.png';
        return new URL(path, STATIC_BASE_URL).toString();
    }

    get name(): string {
        return '미구현 장비';
    }

    get maxEnhanceLevel(): number {
        return 0;
    }

    get stat(): Stat | null {
        return null;
    }

    updateEnhanceLevel(enhanceLevel: number) {
    }

    changeEquipState(equipped: boolean) {
    }

    toggleEquipped() {
    }
}

export type EquipmentItem = KnownEquipmentItem | UnknownEquipmentItem;

function createEquipmentItem(data: Equipment | null): EquipmentItem {
    if (data == null) {
        return new UnknownEquipmentItem();
    }
    return new KnownEquipmentItem(data);
}

export class EquipmentList {
    private static readonly unknownList = Array.from({ length: 6 }, () => new UnknownEquipmentItem());

    @observable equipments: EquipmentItem[] = [];

    @computed get isAllEquipped(): boolean {
        return this.equipments.every(equipment => equipment.equipped);
    }

    @computed get isAllEnhanced(): boolean {
        return this.equipments.every(equipment => !equipment.equipped || equipment.enhanceLevel === equipment.maxEnhanceLevel);
    }

    @computed get statTerms(): [Stat, number][] {
        return this.equipments
            .filter(equipment => equipment.stat != null)
            .map(equipment => [equipment.stat!, 1]);
    }

    @action.bound
    toggleEquipState() {
        const newEquipState = !this.isAllEquipped;
        for (const equipment of this.equipments) {
            equipment.changeEquipState(newEquipState);
        }
    }

    @action.bound
    toggleEnhanceState() {
        if (this.isAllEnhanced) {
            for (const equipment of this.equipments) {
                equipment.updateEnhanceLevel(0);
            }
        } else {
            for (const equipment of this.equipments) {
                if (equipment.equipped) {
                    equipment.updateEnhanceLevel(equipment.maxEnhanceLevel);
                }
            }
        }
    }

    @action.bound
    updateEquipments(equipments: (Equipment | null)[] | null) {
        if (equipments == null) {
            this.equipments = EquipmentList.unknownList;
        } else if (
            this.equipments.length !== equipments.length ||
            !equipments.every((equipment, idx) => {
                const targetData = this.equipments[idx].data;
                if (equipment == null) {
                    return targetData == null;
                }
                return targetData != null && equipment.id === targetData.id;
            })
        ) {
            this.equipments = equipments.map(createEquipmentItem);
        }
    }
}

export class UnitItem {
    @observable rarity: number = this.basicInfo.rarity;
    @observable rank: number = 1;
    @observable level: number = 1;
    @observable loading: boolean = false;
    @observable equipments: EquipmentList = new EquipmentList();
    @observable baseStat: Stat | null = null;
    @observable growthRate: Stat | null = null;
    @observable statByRank: Stat | null = null;

    get minRarity(): number {
        return this.basicInfo.rarity;
    }

    @computed get iconId(): number {
        return this.basicInfo.id + (this.rarity >= 3 ? 30 : 10);
    }

    @computed get iconUrl(): string {
        return new URL(`/icons/unit/${this.iconId}.png`, STATIC_BASE_URL).toString();
    }

    @computed get isValid(): boolean {
        return this.baseStat != null && this.growthRate != null;
    }

    @computed get stat(): Stat | null {
        if (!this.isValid) {
            return null;
        }

        const statTerms: [Stat, number][] = [
            [this.baseStat!, 1],
            [this.growthRate!, this.level + this.rank],
            ...this.equipments.statTerms,
        ];
        if (this.statByRank != null) {
            statTerms.push([this.statByRank, 1]);
        }
        return statCombineLinear(statTerms);
    }

    constructor(
        private transport: Transport,
        public id: number,
        public basicInfo: BasicCharacterInfo,
    ) {}

    @action.bound
    async fetch() {
        try {
            this.loading = true;
            this.baseStat = null;
            this.growthRate = null;
            this.statByRank = null;
            const unit = await this.transport.getCharacterStat({
                name: this.basicInfo.name,
                rarity: this.rarity,
                rank: this.rank,
            });
            runInAction(() => {
                if (unit == null) {
                    this.loading = false;
                    return;
                }
                this.equipments.updateEquipments(unit.equipments);
                this.baseStat = unit.stat.base;
                this.growthRate = unit.stat.growthRate;
                this.statByRank = unit.statByRank;
                this.loading = false;
            });
        } catch (err) {
            runInAction(() => this.loading = false);
            throw err;
        }
    }

    @action.bound
    async updateOptions(options: { rarity?: number; rank?: number; level?: number; }) {
        const { rarity, rank, level } = options;
        if (rarity != null) {
            this.rarity = Math.min(5, Math.max(this.basicInfo.rarity, rarity));
        }
        if (rank != null) {
            this.rank = Math.max(1, rank);
        }
        if (level != null) {
            this.level = Math.max(1, level);
        }

        await this.fetch();
    }
}

export class State {
    private counter: number = 0;

    @observable units: UnitItem[] = [];

    constructor(private transport: Transport) {}

    @action.bound
    public async addUnit(name: string) {
        const basicInfo = await this.transport.getBasicCharacterInfo(name);
        if (basicInfo == null) {
            return;
        }

        const unit = new UnitItem(this.transport, this.counter++, basicInfo);
        runInAction(async () => {
            this.units.push(unit);
            await unit.fetch();
        });
    }
}
