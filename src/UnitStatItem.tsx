import styled from 'astroturf';
import React from 'react';

import { observer } from 'mobx-react';
import { Instance } from 'mobx-state-tree';

import { UnitItem } from './state';

import Stats from './Stats';
import Unit from './Unit';

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
    unit: Instance<typeof UnitItem>;
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
