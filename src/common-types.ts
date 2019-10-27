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
