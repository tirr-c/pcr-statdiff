import styled from 'astroturf';
import React from 'react';

import { observer } from 'mobx-react';

import { UnitDetail } from './state';

const Container = styled.div`
    margin-top: 8px;
`;

interface Props {
    unitDetail: typeof UnitDetail['Type'];
}

export default observer(function EquipmentControl(props: Props) {
    const { unitDetail } = props;
    return (
        <Container>
            <button type="button" onClick={unitDetail.toggleEquipped}>
                {unitDetail.isAllEquipped ? '모두 장비 해제' : '모두 장비'}
            </button>
            <button type="button" onClick={unitDetail.toggleEnhanceState}>
                {unitDetail.isAllEnhanced ? '모두 노강' : '모두 풀강'}
            </button>
        </Container>
    );
});
