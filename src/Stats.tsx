import styled from 'astroturf';
import React from 'react';

import { Stat } from './common-types';

const keys: (keyof Stat)[] = [
    'atk', 'magicStr', 'def', 'magicDef',
    'hp', 'physicalCritical', 'dodge', 'magicCritical',
    'waveHpRecovery', 'waveEnergyRecovery', 'lifeSteal', 'hpRecoveryRate',
    'energyRecoveryRate' ,'energyReduceRate', 'accuracy',
];
const keyToHead: { [K in keyof Stat]: string } = {
    atk: '물리 공격력',
    magicStr: '마법 공격력',
    def: '물리 방어력',
    magicDef: '마법 방어력',
    hp: 'HP',
    physicalCritical: '물리 크리티컬',
    dodge: '회피',
    magicCritical: '마법 크리티컬',
    waveHpRecovery: 'HP 자동 회복',
    waveEnergyRecovery: 'TP 자동 회복',
    lifeSteal: 'HP 흡수',
    hpRecoveryRate: '회복량 상승',
    energyRecoveryRate: 'TP 상승',
    energyReduceRate: 'TP 소비 감소',
    accuracy: '명중',
};

const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 3fr 2fr);
    grid-gap: 8px;
    grid-auto-rows: min-content;
`;

const StatFraction = styled.span`
    font-size: 0.9em;
`;

interface Props {
    stat: Stat;
    className?: string;
}

function StatNumber(props: { value: number; }) {
    const stringValue = props.value.toFixed(2);
    const matchResult = /^(\d*)\.(\d*?)0*$/.exec(stringValue);
    if (matchResult == null) {
        return null;
    }
    const [, n, a] = matchResult;
    return (
        <>
            <span>{n}</span>
            {a !== '' && <StatFraction>.{a}</StatFraction>}
        </>
    );
}

export default function Stats(props: Props) {
    const { stat, className } = props;
    return (
        <StatsContainer className={className}>
            {keys.map(key => (
                <React.Fragment key={key}>
                    <div>{keyToHead[key]}</div>
                    <div><StatNumber value={stat[key]} /></div>
                </React.Fragment>
            ))}
        </StatsContainer>
    );
}
