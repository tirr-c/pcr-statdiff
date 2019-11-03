export interface Stat {
    hp: number;
    atk: number;
    magicStr: number;
    def: number;
    magicDef: number;
    physicalCritical: number;
    magicCritical: number;
    waveHpRecovery: number;
    waveEnergyRecovery: number;
    dodge: number;
    lifeSteal: number;
    hpRecoveryRate: number;
    energyRecoveryRate: number;
    energyReduceRate: number;
    accuracy: number;
}

export enum PromotionLevel {
    Blue = 'BLUE',
    Bronze = 'BRONZE',
    Silver = 'SILVER',
    Gold = 'GOLD',
    Purple = 'PURPLE',
}

export interface Equipment {
    id: number;
    name: string;
    promotionLevel: PromotionLevel;
    requiredLevel: number;
    stat: Stat;
    growthRate: Stat;
}

export interface BasicCharacterInfo {
    id: number;
    name: string;
    rarity: number;
}

export interface CharacterUnit {
    id: number;
    name: string;
    stat: {
        base: Stat;
        growthRate: Stat;
    };
    statByRank: Stat | null;
    equipments: (Equipment | null)[] | null;
}
