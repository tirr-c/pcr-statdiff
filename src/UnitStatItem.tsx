import styled from 'astroturf';
import React from 'react';

import { autorun } from 'mobx';
import { observer } from 'mobx-react';

import { useQuery } from '@apollo/react-hooks';

import { CharacterUnit, Stat } from './common-types';
import { UnitItem } from './state';
import { statCombineLinear, calculateFinalStat } from './utils';

import Stats from './Stats';
import Unit from './Unit';

interface CharacterStatVariables {
    name: string;
    rarity: number;
    rank: number;
}

type CharacterStatResult = {
    unit: CharacterUnit;
};

const UnitStatItemContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const StatContainer = styled.div`
    width: 500px;

    @media (max-width: 516px) {
        width: 250px;
    }
`;

interface Props {
    unit: UnitItem;
}

export default observer(function UnitStatItem(props: Props) {
    const { unit } = props;
    const name = unit.basicInfo.name;
    const [rarityDraft, setRarityDraft] = React.useState(3);
    const [rankDraft, setRankDraft] = React.useState('10');
    const [levelDraft, setLevelDraft] = React.useState('107');

    React.useEffect(() => {
        return autorun(() => {
            setRarityDraft(unit.rarity);
            setRankDraft(String(unit.rank));
            setLevelDraft(String(unit.level));
        });
    }, [unit]);

    const handleRequery = React.useCallback(() => {
        const rarity = rarityDraft;
        const rank = Number(rankDraft);
        const level = Number(levelDraft);
        unit.updateOptions({ rarity, rank, level });
    }, [unit, rarityDraft, rankDraft, levelDraft]);

    if (unit.stat == null) {
        return null;
    }

    const isDraft = unit.rarity !== rarityDraft || String(unit.rank) !== rankDraft || String(unit.level) !== levelDraft;
    return (
        <UnitStatItemContainer>
            <Unit
                unit={unit}
                draft={isDraft}
                rarityDraft={rarityDraft}
                rankDraft={rankDraft}
                levelDraft={levelDraft}
                onRarityDraftChange={setRarityDraft}
                onRankDraftChange={setRankDraft}
                onLevelDraftChange={setLevelDraft}
                onApplyClick={handleRequery}
            />
            <StatContainer>
                <Stats stat={unit.stat} />
            </StatContainer>
        </UnitStatItemContainer>
    );
});
