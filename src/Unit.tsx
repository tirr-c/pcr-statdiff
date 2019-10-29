import styled from 'astroturf';
import React from 'react';

import { observer } from 'mobx-react';

import { CharacterUnit, Equipment, PromotionLevel } from './common-types';
import { EquipmentItem, UnitItem } from './state';

import Stars from './Stars';

const buildUnitUrl = (id: number, rarity: number) => {
    const realId = id + (rarity >= 3 ? 30 : 10);
    return new URL(`/icons/unit/${realId}.png`, STATIC_BASE_URL).toString();
};
const buildEquipmentUrl = (id: number, flag: boolean) => {
    const path = flag ? `/icons/equipment/${id}.png` : `/icons/equipment/invalid/${id}.png`;
    return new URL(path, STATIC_BASE_URL).toString();
};

const UnitContainer = styled.div`
    width: 500px;
    margin-bottom: 12px;
`;

const UnitData = styled.div`
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

    @media (max-width: 516px) {
        grid-template-columns: 1fr;
    }
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

const EquipmentDetail = styled.div`
    margin-left: 8px;
`;

const EquipmentName = styled.div`
    font-size: 0.9em;
`;

interface EquipmentViewProps {
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

const EquipmentView = observer((props: EquipmentViewProps) => {
    const { equipment } = props;
    return (
        <Equipment>
            <img src={buildEquipmentUrl(equipment.data.id, equipment.equipped)} onClick={equipment.toggleEquipped} />
            <EquipmentDetail>
                <EquipmentName>{equipment.data.name}</EquipmentName>
                <Stars
                    value={equipment.enhanceLevel}
                    max={getMaxEnhance(equipment.data.promotionLevel)}
                    onChange={equipment.updateEnhanceLevel}
                />
            </EquipmentDetail>
        </Equipment>
    );
});

interface Props {
    unit: UnitItem;
    draft?: boolean;
    rarityDraft: number;
    rankDraft: string;
    levelDraft: string;
    onRarityDraftChange?(rarity: number): void;
    onRankDraftChange?(rank: string): void;
    onLevelDraftChange?(level: string): void;
    onApplyClick?(): void;
}

export default observer(function Unit(props: Props) {
    const { unit, draft, rarityDraft, rankDraft, levelDraft } = props;
    const { onRankDraftChange, onLevelDraftChange } = props;

    const handleRankChange = React.useCallback(e => {
        onRankDraftChange && onRankDraftChange(e.target.value);
    }, [onRankDraftChange]);

    const handleLevelChange = React.useCallback(e => {
        onLevelDraftChange && onLevelDraftChange(e.target.value);
    }, [onLevelDraftChange]);

    return (
        <UnitContainer>
            <UnitData>
                <img src={buildUnitUrl(unit.basicInfo.id, unit.rarity)} />
                <UnitDetail>
                    <div>{unit.basicInfo.name}</div>
                    <Stars value={rarityDraft} max={5} onChange={props.onRarityDraftChange} />
                    <div>RANK <input type="number" min={1} value={rankDraft} onChange={handleRankChange} /></div>
                    <div>레벨 <input type="number" min={1} value={levelDraft} onChange={handleLevelChange} /></div>
                    <button disabled={!draft} onClick={props.onApplyClick}>적용</button>
                </UnitDetail>
            </UnitData>
            <Equipments>
                {unit.equipments.map((equipment, idx) => (
                    <EquipmentView key={idx} equipment={equipment} />
                ))}
            </Equipments>
        </UnitContainer>
    );
});
