import React from 'react';

import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

import CharacterStatQuery from './queries/CharacterStat.gql';

interface CharacterStatVariables {
    name: string;
    rarity: number;
    rank: number;
}

interface Stat {
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

enum PromotionLevel {
    Blue = 'BLUE',
    Bronze = 'BRONZE',
    Silver = 'SILVER',
    Gold = 'GOLD',
    Purple = 'PURPLE',
}

type CharacterStatResult = {
    unit: {
        id: number;
        name: string;
        stat: {
            base: Stat;
            growthRate: Stat;
        };
        statByRank: Stat;
        equipments: {
            id: number;
            name: string;
            promotionLevel: PromotionLevel;
            requiredLevel: number;
            stat: Stat;
            growthRate: Stat;
        }[];
    };
};

function getMaxEnhance(promotionLevel: PromotionLevel) {
    switch (promotionLevel) {
        case PromotionLevel.Blue: return 0;
        case PromotionLevel.Bronze: return 1;
        case PromotionLevel.Silver: return 3;
        case PromotionLevel.Gold:
        case PromotionLevel.Purple: return 5;
    }
}

function statCombineLinear(statCoeffPair: [Stat, number][]) {
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

export default function App() {
    const name = '토모';
    const rarity = 3;
    const rank = 10;
    const level = 107;
    const { loading, error, data } = useQuery<CharacterStatResult, CharacterStatVariables>(
        CharacterStatQuery,
        { variables: { name, rarity, rank } },
    );
    if (error) {
        return null;
    }
    if (loading || data == null) {
        return null;
    }
    const combinedStat = statCombineLinear([
        [data.unit.stat.base, 1],
        [data.unit.stat.growthRate, level + rank],
        [data.unit.statByRank, 1],
    ]);
    return <div>{JSON.stringify(combinedStat)}</div>;
}
