import { reaction } from 'mobx';
import { flow, getEnv, types } from 'mobx-state-tree';

import ApolloClient from 'apollo-boost';

import { BasicCharacterInfo, Equipment, PromotionLevel, Stat } from './common-types';
import Transport from './transport';
import { statCombineLinear } from './utils';

interface Env {
    transport: Transport;
}

export const EquipmentItemInner = types.model('EquipmentItemInner', {
    data: types.frozen<Equipment>(),
    equipped: false,
    enhanceLevel: 0,
});

export const EquipmentItem = types.model('EquipmentItem', {
    inner: types.maybeNull(EquipmentItemInner),
})
.views(self => ({
    get isKnown() {
        return self.inner != null;
    },
    get name() {
        return self.inner ? self.inner.data.name : '미구현 장비';
    },
    get iconKey() {
        if (self.inner == null) {
            return '999999';
        }
        const id = self.inner.data.id;
        return self.inner.equipped ? `${id}` : `invalid/${id}`;
    },
    get maxEnhanceLevel() {
        if (self.inner == null) {
            return 0;
        }
        const promotionLevel = self.inner.data.promotionLevel;
        switch (promotionLevel) {
            case PromotionLevel.Blue: return 0;
            case PromotionLevel.Bronze: return 1;
            case PromotionLevel.Silver: return 3;
            case PromotionLevel.Gold:
            case PromotionLevel.Purple: return 5;
        }
    },
    get stat() {
        if (self.inner == null || !self.inner.equipped) {
            return null;
        }
        return statCombineLinear([
            [self.inner.data.stat, 1],
            [self.inner.data.growthRate, self.inner.enhanceLevel],
        ]);
    },
}))
.views(self => ({
    get iconUrl() {
        const key = self.iconKey;
        const path = `/icons/equipment/${key}.png`;
        return new URL(path, STATIC_BASE_URL).toString();
    },
}))
.actions(self => ({
    setEnhanceLevel(enhanceLevel: number) {
        if (self.inner == null) {
            return;
        }
        self.inner.enhanceLevel = Math.max(0, Math.min(self.maxEnhanceLevel, enhanceLevel));
    },
    setEquipped(equipped: boolean) {
        if (self.inner == null) {
            return;
        }
        self.inner.equipped = equipped;
    },
    toggleEquipped() {
        if (self.inner == null) {
            return;
        }
        self.inner.equipped = !self.inner.equipped;
    },
}));

export const UnitDetail = types.model('UnitDetail', {
    baseStat: types.frozen<Stat>(),
    growthRate: types.frozen<Stat>(),
    statByRank: types.maybeNull(types.frozen<Stat>()),
    equipments: types.array(EquipmentItem),
})
.views(self => ({
    get isAllEquipped(): boolean {
        return self.equipments.every(equipment => equipment.inner == null || equipment.inner.equipped);
    },
    get isAllEnhanced(): boolean {
        return self.equipments.every(equipment => (
            equipment.inner == null ||
            equipment.inner.enhanceLevel === equipment.maxEnhanceLevel
        ));
    },
    stat(rank: number, level: number): Stat {
        const equipmentStatTerms: [Stat, number][] = self.equipments
            .filter(equipment => equipment.stat != null)
            .map(equipment => [equipment.stat!, 1]);
        const statTerms: [Stat, number][] = [
            [self.baseStat, 1],
            [self.growthRate, level + rank],
            ...equipmentStatTerms,
        ];
        if (self.statByRank != null) {
            statTerms.push([self.statByRank, 1]);
        }
        return statCombineLinear(statTerms);
    },
}))
.actions(self => ({
    updateEquipments(equipments: (Equipment | null)[]) {
        if (
            self.equipments.length !== equipments.length ||
            !equipments.every((equipment, idx) => {
                const targetData = self.equipments[idx].inner;
                if (equipment == null) {
                    return targetData == null;
                }
                return targetData != null && equipment.id === targetData.data.id;
            })
        ) {
            const equipmentList: typeof EquipmentItem['Type'][] = equipments.map(equipment => (
                EquipmentItem.create({
                    inner: equipment && EquipmentItemInner.create({
                        data: equipment,
                    }),
                })
            ));
            self.equipments.splice(0, self.equipments.length, ...equipmentList);
        }
    },
    toggleEquipped() {
        const newEquipState = !self.isAllEquipped;
        for (const equipment of self.equipments) {
            equipment.setEquipped(newEquipState);
        }
    },
    toggleEnhanceState() {
        const newEnhanceLevel = self.isAllEnhanced ? 0 : Infinity;
        for (const equipment of self.equipments) {
            equipment.setEnhanceLevel(newEnhanceLevel);
        }
    },
}));

export const UnitItem = types.model('UnitItem', {
    id: types.identifierNumber,
    basicInfo: types.frozen<BasicCharacterInfo>(),
    rarity: types.number,
    rank: 1,
    level: 1,
    loading: true,
    detail: types.optional(
        types.maybeNull(UnitDetail),
        null,
    ),
})
.views(self => ({
    get name(): string {
        return self.basicInfo.name;
    },
    get minRarity(): number {
        return self.basicInfo.rarity;
    },
    get iconId(): number {
        return self.basicInfo.id + (self.rarity >= 3 ? 30 : 10);
    },
    get state(): 'loading' | 'done' | 'error' {
        if (self.loading) {
            return 'loading';
        }
        if (self.detail == null) {
            return 'error';
        }
        return 'done';
    },
    get stat(): Stat | null {
        return self.detail && self.detail.stat(self.rank, self.level);
    },
}))
.views(self => ({
    get iconUrl(): string {
        return new URL(`/icons/unit/${self.iconId}.png`, STATIC_BASE_URL).toString();
    }
}))
.actions(self => ({
    fetch: flow(function* () {
        const { transport } = getEnv<Env>(self);
        try {
            self.loading = true;
            const unit = yield transport.getCharacterStat({
                name: self.name,
                rarity: self.rarity,
                rank: self.rank,
            });
            if (unit == null || unit.equipments == null) {
                self.detail = null;
                return;
            }
            if (self.detail == null) {
                self.detail = UnitDetail.create({
                    baseStat: unit.stat.base,
                    growthRate: unit.stat.growthRate,
                    statByRank: unit.statByRank,
                });
            } else {
                self.detail.baseStat = unit.stat.base;
                self.detail.growthRate = unit.stat.growthRate;
                self.detail.statByRank = unit.statByRank;
            }
            self.detail.updateEquipments(unit.equipments);
        } finally {
            self.loading = false;
        }
    }),
    setOptions(options: { rarity?: number; rank?: number; level?: number; }) {
        const { rarity, rank, level } = options;
        if (rarity != null) {
            self.rarity = Math.max(self.minRarity, Math.min(5, rarity));
        }
        if (rank != null) {
            self.rank = Math.max(1, rank);
        }
        if (level != null) {
            self.level = Math.max(1, level);
        }
    }
}))
.actions(self => {
    let dispose: () => void;
    return {
        afterCreate() {
            dispose = reaction(
                () => ({
                    name: self.name,
                    rarity: self.rarity,
                    rank: self.rank,
                    level: self.level,
                }),
                self.fetch,
            );
        },
        beforeDestroy() {
            dispose && dispose();
        },
    };
});

export const UnitStore = types.model('UnitStore', {
    units: types.optional(types.array(UnitItem), []),
})
.actions(self => {
    let counter = 0;
    return {
        addUnit: flow(function* (name: string) {
            const { transport } = getEnv<Env>(self);
            const basicInfo = yield transport.getBasicCharacterInfo(name);
            if (basicInfo == null) {
                return;
            }

            const unit = UnitItem.create({
                id: counter++,
                basicInfo,
                rarity: basicInfo.rarity,
            });
            self.units.push(unit);
            yield unit.fetch();
        }),
    };
});
