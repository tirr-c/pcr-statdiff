import styled from 'astroturf';
import React from 'react';

import { reaction } from 'mobx';
import { observer } from 'mobx-react';

import { CharacterUnit, Equipment, PromotionLevel } from './common-types';
import { EquipmentItem, UnitItem } from './state';

import EquipmentControl from './EquipmentControl';
import EquipmentList from './EquipmentList';
import Stars from './Stars';

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

const UnitDetail = styled.form`
    margin-left: 8px;
`;

interface Props {
    unit: typeof UnitItem['Type'];
}

export default observer(function Unit(props: Props) {
    const { unit } = props;
    const [rarityDraft, setRarityDraft] = React.useState(() => unit.rarity);
    const [rankDraft, setRankDraft] = React.useState(() => String(unit.rank));
    const [levelDraft, setLevelDraft] = React.useState(() => String(unit.level));
    const isDraft = unit.rarity !== rarityDraft || String(unit.rank) !== rankDraft || String(unit.level) !== levelDraft;

    React.useEffect(() => {
        if (!unit.loading) {
            setRarityDraft(unit.rarity);
            setRankDraft(String(unit.rank));
            setLevelDraft(String(unit.level));
        }
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

    const handleRequery = React.useCallback(e => {
        e.preventDefault();
        const rarity = rarityDraft;
        const rank = Number(rankDraft);
        const level = Number(levelDraft);
        unit.setOptions({ rarity, rank, level });
    }, [unit, rarityDraft, rankDraft, levelDraft]);

    const handleRankChange = React.useCallback(e => {
        setRankDraft(e.target.value);
    }, []);

    const handleLevelChange = React.useCallback(e => {
        setLevelDraft(e.target.value);
    }, []);

    return (
        <UnitContainer>
            <UnitData>
                <img key={unit.iconId} src={unit.iconUrl} />
                <UnitDetail onSubmit={handleRequery}>
                    <div>{unit.basicInfo.name}</div>
                    <Stars value={rarityDraft} max={5} onChange={setRarityDraft} />
                    <div>RANK <input type="number" min={1} value={rankDraft} onChange={handleRankChange} /></div>
                    <div>레벨 <input type="number" min={1} value={levelDraft} onChange={handleLevelChange} /></div>
                    <input type="submit" disabled={unit.loading || !isDraft} value={unit.loading ? '로드 중' : '적용'} />
                </UnitDetail>
            </UnitData>
            {unit.detail != null && (
                <>
                    <EquipmentList equipments={unit.detail.equipments} />
                    <EquipmentControl unitDetail={unit.detail} />
                </>
            )}
        </UnitContainer>
    );
});
