import styled from 'astroturf';
import React from 'react';

import { reaction } from 'mobx';
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
        </Equipment>
    );
});

interface Props {
    unit: UnitItem;
}

export default observer(function Unit(props: Props) {
    const { unit } = props;
    const [rarityDraft, setRarityDraft] = React.useState(1);
    const [rankDraft, setRankDraft] = React.useState('1');
    const [levelDraft, setLevelDraft] = React.useState('1');

    React.useEffect(() => {
        return reaction(
            () => unit.loading,
            loading => {
                if (!loading) {
                    setRarityDraft(unit.rarity);
                    setRankDraft(String(unit.rank));
                    setLevelDraft(String(unit.level));
                }
            },
        );
    }, [unit]);

    const handleRequery = React.useCallback(() => {
        const rarity = rarityDraft;
        const rank = Number(rankDraft);
        const level = Number(levelDraft);
        unit.updateOptions({ rarity, rank, level });
    }, [unit, rarityDraft, rankDraft, levelDraft]);

    const handleRankChange = React.useCallback(e => {
        setRankDraft(e.target.value);
    }, []);

    const handleLevelChange = React.useCallback(e => {
        setLevelDraft(e.target.value);
    }, []);

    const isDraft = unit.rarity !== rarityDraft || String(unit.rank) !== rankDraft || String(unit.level) !== levelDraft;
    return (
        <UnitContainer>
            <UnitData>
                <img src={buildUnitUrl(unit.basicInfo.id, unit.rarity)} />
                <UnitDetail>
                    <div>{unit.basicInfo.name}</div>
                    <Stars value={rarityDraft} max={5} onChange={setRarityDraft} />
                    <div>RANK <input type="number" min={1} value={rankDraft} onChange={handleRankChange} /></div>
                    <div>레벨 <input type="number" min={1} value={levelDraft} onChange={handleLevelChange} /></div>
                    <button disabled={unit.loading || !isDraft} onClick={handleRequery}>{unit.loading ? '로드 중' : '적용'}</button>
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
