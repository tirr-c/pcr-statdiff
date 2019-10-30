import { action, computed, observable, runInAction } from 'mobx';

import ApolloClient from 'apollo-boost';

import { BasicCharacterInfo, CharacterUnit, Equipment, Stat } from './common-types';
import { statCombineLinear } from './utils';
import BasicCharacterInfoQuery from './queries/BasicCharacterInfo.gql';
import CharacterStatQuery from './queries/CharacterStat.gql';

export class EquipmentItem {
    @observable equipped: boolean = false;
    @observable enhanceLevel: number = 0;

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
    toggleEquipped() {
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
        console.log(statTerms);
        return statCombineLinear(statTerms);
    }

    constructor(
        private apolloClient: ApolloClient<any>,
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
            const result = await this.apolloClient.query<{ unit: CharacterUnit | null }>({
                query: CharacterStatQuery,
                variables: { name: this.basicInfo.name, rarity: this.rarity, rank: this.rank },
            });
            const unit = result.data.unit;
            runInAction(() => {
                if (unit == null) {
                    this.loading = false;
                    return;
                }
                if (
                    this.equipments.length !== unit.equipments.length ||
                    !unit.equipments.every((equipment, idx) => equipment.id === this.equipments[idx].data.id)
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

    constructor(private apolloClient: ApolloClient<any>) {}

    @action.bound
    public async addUnit(name: string) {
        const result = await this.apolloClient.query<{ unit: BasicCharacterInfo | null }>({
            query: BasicCharacterInfoQuery,
            variables: { name },
        });
        if (result.data.unit == null) {
            return;
        }

        const basicInfo = result.data.unit;
        const unit = new UnitItem(this.apolloClient, this.counter++, basicInfo);
        runInAction(async () => {
            this.units.push(unit);
            await unit.fetch();
        });
    }
}
