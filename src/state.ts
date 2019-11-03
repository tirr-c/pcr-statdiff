import { action, computed, observable, runInAction } from 'mobx';

import ApolloClient from 'apollo-boost';

import { BasicCharacterInfo, Equipment, PromotionLevel, Stat } from './common-types';
import Transport from './transport';
import { statCombineLinear } from './utils';

export class EquipmentItem {
    @observable equipped: boolean = false;
    @observable enhanceLevel: number = 0;

    @computed get iconKey(): string {
        if (this.data == null) {
            return '999999';
        } else {
            const id = this.data.id;
            return this.equipped ? `${id}` : `invalid/${id}`;
        }
    }

    @computed get iconUrl(): string {
        const key = this.iconKey;
        const path = `/icons/equipment/${key}.png`;
        return new URL(path, STATIC_BASE_URL).toString();
    }

    get name(): string {
        return this.data ? this.data.name : '미구현 장비';
    }

    @computed get maxEnhanceLevel(): number {
        if (this.data == null) {
            return 0;
        }
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
        if (this.data == null || !this.equipped) {
            return null;
        }
        return statCombineLinear([
            [this.data.stat, 1],
            [this.data.growthRate, this.enhanceLevel],
        ]);
    }

    constructor(public data: Equipment | null) {}

    @action.bound
    updateEnhanceLevel(enhanceLevel: number) {
        if (this.data == null) {
            return;
        }
        this.enhanceLevel = enhanceLevel;
    }

    @action.bound
    toggleEquipped() {
        if (this.data == null) {
            return;
        }
        this.equipped = !this.equipped;
    }
}

export class UnitItem {
    @observable rarity: number = this.basicInfo.rarity;
    @observable rank: number = 1;
    @observable level: number = 1;
    @observable loading: boolean = false;
    @observable equipments: EquipmentItem[] = [];
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
        ];
        if (this.statByRank != null) {
            statTerms.push([this.statByRank, 1]);
        }
        for (const equipment of this.equipments) {
            if (equipment.stat == null) {
                continue;
            }
            statTerms.push([equipment.stat, 1]);
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
                if (unit.equipments == null) {
                    this.equipments = [];
                } else if (
                    this.equipments.length !== unit.equipments.length ||
                    !unit.equipments.every((equipment, idx) => {
                        const targetData = this.equipments[idx].data;
                        if (equipment == null) {
                            return targetData == null;
                        }
                        return targetData != null && equipment.id === targetData.id;
                    })
                ) {
                    this.equipments = unit.equipments.map(equipment => new EquipmentItem(equipment));
                }
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
