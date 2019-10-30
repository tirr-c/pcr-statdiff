import styled from 'astroturf';
import React from 'react';

import { autorun } from 'mobx';
import { observer } from 'mobx-react';

import { useQuery } from '@apollo/react-hooks';

import { CharacterUnit, Stat } from './common-types';
import { UnitItem } from './state';
import { statCombineLinear, calculateFinalStat } from './utils';

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

const UnitStatItemContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    padding-top: 12px;
    border-top: 1px solid silver;
`;

const StatContainer = styled.div`
    width: 500px;

    @media (max-width: 516px) {
        width: 250px;
    }
`;

interface Props {
    unit: UnitItem;
}

export default observer(function UnitStatItem(props: Props) {
    const { unit } = props;

    return (
        <UnitStatItemContainer>
            <Unit unit={unit} />
            {unit.stat != null && (
                <StatContainer>
                    <Stats stat={unit.stat} />
                </StatContainer>
            )}
        </UnitStatItemContainer>
    );
});
