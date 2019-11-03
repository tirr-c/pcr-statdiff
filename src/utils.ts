import { CharacterUnit, Equipment, PromotionLevel, Stat } from './common-types';

export function statCombineLinear(statCoeffPair: [Stat, number][]) {
    const result: Stat = {
        hp: 0,
        atk: 0,
        magicStr: 0,
        def: 0,
        magicDef: 0,
        physicalCritical: 0,
        magicCritical: 0,
        waveHpRecovery: 0,
        waveEnergyRecovery: 0,
        dodge: 0,
        lifeSteal: 0,
        hpRecoveryRate: 0,
        energyRecoveryRate: 0,
        energyReduceRate: 0,
        accuracy: 0,
    };
    for (const [stat, coeff] of statCoeffPair) {
        for (const key in result) {
            (result as any)[key] += (stat as any)[key] * coeff;
        }
    }
    return result;
}

export function calculateFinalStat(
    unit: CharacterUnit,
    rank: number,
    level: number,
    equipmentFlags: boolean[],
    equipmentEnhanceLevels: number[],
): Stat {
    const filteredEquipments = (unit.equipments || []).filter(equipment => equipment != null) as Equipment[];
    const equipmentBaseStats = filteredEquipments
        .map((equipment): [Stat, number] => [equipment.stat, 1])
        .filter((_, idx) => equipmentFlags[idx]);
    const equipmentGrowthStats = filteredEquipments
        .map((equipment, idx): [Stat, number] => [equipment.growthRate, equipmentEnhanceLevels[idx]])
        .filter((_, idx) => equipmentFlags[idx]);
    return statCombineLinear([
        [unit.stat.base, 1],
        [unit.stat.growthRate, level + rank],
        ...(unit.statByRank == null ? [] : [[unit.statByRank, 1]]) as [Stat, number][],
        ...equipmentBaseStats,
        ...equipmentGrowthStats,
    ]);
}
