import styled from 'astroturf';
import React from 'react';

import { observer } from 'mobx-react';
import { Instance } from 'mobx-state-tree';

import { EquipmentItem } from './state';

import EquipmentItemView from './EquipmentItemView';

const Container = styled.ul`
    margin: 0;
    padding: 0;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 8px;
    grid-auto-rows: min-content;

    @media (max-width: 516px) {
        grid-template-columns: 1fr;
    }
`;

interface Props {
    equipments: Instance<typeof EquipmentItem>[];
}

export default observer(function EquipmentList(props: Props) {
    return (
        <Container>
            {props.equipments.map((equipment, idx) => (
                <EquipmentItemView key={idx} equipment={equipment} />
            ))}
        </Container>
    );
});
