import styled, { css } from 'astroturf';
import React from 'react';

import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

import { CharacterUnit, PromotionLevel, Stat } from './common-types';
import CharacterStatQuery from './queries/CharacterStat.gql';

import Stats from './Stats';
import Unit from './Unit';

interface CharacterStatVariables {
    name: string;
    rarity: number;
    rank: number;
}

type CharacterStatResult = {
    unit: CharacterUnit;
};

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

function calculateFinalStat(
    unit: CharacterUnit,
    rank: number,
    level: number,
    equipmentFlags: boolean[],
    equipmentEnhanceLevels: number[],
): Stat {
    const equipmentBaseStats = unit.equipments
        .map((equipment): [Stat, number] => [equipment.stat, 1])
        .filter((_, idx) => equipmentFlags[idx]);
    const equipmentGrowthStats = unit.equipments
        .map((equipment, idx): [Stat, number] => [equipment.growthRate, equipmentEnhanceLevels[idx]])
        .filter((_, idx) => equipmentFlags[idx]);
    return statCombineLinear([
        [unit.stat.base, 1],
        [unit.stat.growthRate, level + rank],
        [unit.statByRank, 1],
        ...equipmentBaseStats,
        ...equipmentGrowthStats,
    ]);
}

const AppContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const StatContainer = styled.div`
    width: 500px;

    @media (max-width: 516px) {
        width: 250px;
    }
`;

export default function App() {
    const [name, setName] = React.useState('토모');
    const [rarity, setRarity] = React.useState(3);
    const [rank, setRank] = React.useState(10);
    const [level, setLevel] = React.useState(107);
    const [equipmentFlags, setEquipmentFlags] = React.useState([false, true, true, true, true, true]);
    const [enhanceLevels, setEnhanceLevels] = React.useState([0, 0, 0, 0, 0, 0]);

    const handleEquipmentChange = React.useCallback((index: number, flag: boolean, enhanceLevel: number) => {
        setEquipmentFlags(equipmentFlags => {
            if (equipmentFlags[index] === flag) {
                return equipmentFlags;
            }
            const result = [...equipmentFlags];
            result[index] = flag;
            return result;
        });
        setEnhanceLevels(enhanceLevels => {
            if (enhanceLevels[index] === enhanceLevel) {
                return enhanceLevels;
            }
            const result = [...enhanceLevels];
            result[index] = enhanceLevel;
            return result;
        });
    }, []);

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

    return (
        <AppContainer>
            <Unit
                unit={data.unit}
                rarity={rarity}
                rank={rank}
                enhanceLevels={enhanceLevels}
                equipmentFlags={equipmentFlags}
                onEquipmentChange={handleEquipmentChange}
            />
            <StatContainer>
                <Stats
                    stat={calculateFinalStat(data.unit, rank, level, equipmentFlags, enhanceLevels)}
                />
            </StatContainer>
        </AppContainer>
    );
}
