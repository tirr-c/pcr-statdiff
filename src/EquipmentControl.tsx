import styled from 'astroturf';
import React from 'react';

import { observer } from 'mobx-react';

import { EquipmentList } from './state';

const Container = styled.div`
`;

interface Props {
    equipments: EquipmentList;
}

export default observer(function EquipmentControl(props: Props) {
    const { equipments } = props;
    return (
        <Container>
            <button type="button" onClick={equipments.toggleEquipState}>
                {equipments.isAllEquipped ? '모두 장비 해제' : '모두 장비'}
            </button>
            <button type="button" onClick={equipments.toggleEnhanceState}>
                {equipments.isAllEnhanced ? '모두 노강' : '모두 풀강'}
            </button>
        </Container>
    );
});
