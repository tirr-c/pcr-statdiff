import styled from 'astroturf';
import React from 'react';

import { observer } from 'mobx-react';

import { PromotionLevel } from './common-types';
import { EquipmentItem } from './state';

import Stars from './Stars';

const buildEquipmentUrl = (id: number, flag: boolean) => {
    const path = flag ? `/icons/equipment/${id}.png` : `/icons/equipment/invalid/${id}.png`;
    return new URL(path, STATIC_BASE_URL).toString();
};

const Container = styled.li`
    display: flex;
    align-items: center;
    list-style: none;

    > img {
        width: 64px;
        height: 64px;
    }
`;

const EquipmentDetail = styled.div`
    margin-left: 8px;
`;

const EquipmentName = styled.div`
    font-size: 0.9em;
`;

interface Props {
    equipment: EquipmentItem;
}

function getMaxEnhance(promotionLevel: PromotionLevel) {
    switch (promotionLevel) {
        case PromotionLevel.Blue: return 0;
        case PromotionLevel.Bronze: return 1;
        case PromotionLevel.Silver: return 3;
        case PromotionLevel.Gold:
        case PromotionLevel.Purple: return 5;
    }
}

export default observer(function EquipmentItemView(props: Props) {
    const { equipment } = props;
    return (
        <Container>
            <img
                key={`${equipment.data.id}-${equipment.equipped}`}
                src={buildEquipmentUrl(equipment.data.id, equipment.equipped)}
                onClick={equipment.toggleEquipped}
            />
            <EquipmentDetail>
                <EquipmentName>{equipment.data.name}</EquipmentName>
                <Stars
                    value={equipment.enhanceLevel}
                    max={getMaxEnhance(equipment.data.promotionLevel)}
                    onChange={equipment.updateEnhanceLevel}
                />
            </EquipmentDetail>
        </Container>
    );
});
