import styled, { css } from 'astroturf';
import React from 'react';

import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

import { PromotionLevel, Stat } from './common-types';
import CharacterStatQuery from './queries/CharacterStat.gql';

import Stats from './Stats';

interface CharacterStatVariables {
    name: string;
    rarity: number;
    rank: number;
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

function calculateFinalStat(unit: CharacterStatResult['unit'], rank: number, level: number, equipmentEnhanceLevels: [number, number, number, number, number, number]): Stat {
    return statCombineLinear([
        [unit.stat.base, 1],
        [unit.stat.growthRate, level + rank],
        [unit.statByRank, 1],
        ...unit.equipments.map((equipment): [Stat, number] => [equipment.stat, 1]),
        ...unit.equipments.map((equipment, idx): [Stat, number] => [equipment.growthRate, equipmentEnhanceLevels[idx]]),
    ]);
}

const buildUnitUrl = (id: number, rarity: number) => {
    const realId = id + (rarity >= 3 ? 30 : 10);
    return new URL(`/icons/unit/${realId}.png`, 'https://ames-static.tirr.dev').toString();
};
const buildEquipmentUrl = (id: number) => new URL(`/icons/equipment/${id}.png`, 'https://ames-static.tirr.dev').toString();

const AppContainer = styled.div`
    display: flex;
`;
const UnitContainer = styled.div`
    width: 500px;
`;

const Unit = styled.div`
    display: flex;
    margin-bottom: 12px;
    > img {
        width: 96px;
        height: 96px;
    }
`;
const UnitDetail = styled.div`
    margin-left: 8px;
`;

const Equipments = styled.ul`
    margin: 0;
    padding: 0;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 8px;
    grid-auto-rows: min-content;
`;
const Equipment = styled.li`
    display: flex;
    align-items: center;
    list-style: none;

    > img {
        width: 64px;
        height: 64px;
    }
`;
const EquipmentName = styled.div`
    margin-left: 8px;
    font-size: 0.9em;
`;

const styles = css`
    .statContainer {
        width: 500px;
    }
`;

export default function App() {
    const [name, setName] = React.useState('토모');
    const [rarity, setRarity] = React.useState(3);
    const [rank, setRank] = React.useState(10);
    const [level, setLevel] = React.useState(107);

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
            <UnitContainer>
                <Unit>
                    <img src={buildUnitUrl(data.unit.id, rarity)} />
                    <UnitDetail>
                        <div>{data.unit.name} ★{rarity}</div>
                        <div>RANK {rank}</div>
                    </UnitDetail>
                </Unit>
                <Equipments>
                    {data.unit.equipments.map((equipment, idx) => (
                        <Equipment key={idx}>
                            <img src={buildEquipmentUrl(equipment.id)} />
                            <EquipmentName>{equipment.name}</EquipmentName>
                        </Equipment>
                    ))}
                </Equipments>
            </UnitContainer>
            <Stats className={styles.statContainer} stat={calculateFinalStat(data.unit, rank, level, [0, 0, 0, 0, 0, 0])} />
        </AppContainer>
    );
}
