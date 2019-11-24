import styled from 'astroturf';
import React from 'react';

import { observer } from 'mobx-react';
import { Instance } from 'mobx-state-tree';

import { EquipmentItem } from './state';

const Container = styled.ul`
    width: 64px;
    display: flex;
    flex-wrap: wrap;

    line-height: 0;
`;

const Icon = styled.img`
    width: 32px;
    height: 32px;
`;

interface Props {
    equipments: Instance<typeof EquipmentItem>[];
}

export default observer(function EquipmentIcons(props: Props) {
    return (
        <Container>
            {props.equipments.map(equipment => (
                <li>
                    <Icon src={equipment.iconUrl} />
                </li>
            ))}
        </Container>
    );
});
