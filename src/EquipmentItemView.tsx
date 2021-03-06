import styled from 'astroturf';
import React from 'react';

import { observer } from 'mobx-react';
import { Instance } from 'mobx-state-tree';

import { EquipmentItem } from './state';

import Stars from './Stars';

const Container = styled.li`
    display: flex;
    align-items: stretch;

    > img {
        width: 64px;
        height: 64px;
    }
`;

const EquipmentDetail = styled.div`
    margin-left: 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const EquipmentName = styled.div`
    font-size: 0.9em;
`;

interface Props {
    equipment: Instance<typeof EquipmentItem>;
}

export default observer(function EquipmentItemView(props: Props) {
    const { equipment } = props;
    return (
        <Container>
            <img
                key={equipment.iconKey}
                src={equipment.iconUrl}
                onClick={equipment.toggleEquipped}
            />
            <EquipmentDetail>
                <EquipmentName>{equipment.name}</EquipmentName>
                {equipment.inner != null && equipment.maxEnhanceLevel > 0 && (
                    <Stars
                        value={equipment.inner.enhanceLevel}
                        max={equipment.maxEnhanceLevel}
                        onChange={equipment.setEnhanceLevel}
                    />
                )}
            </EquipmentDetail>
        </Container>
    );
});
