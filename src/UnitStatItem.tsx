import styled from 'astroturf';
import React from 'react';

import { useQuery } from '@apollo/react-hooks';

import { CharacterUnit, Stat } from './common-types';
import CharacterStatQuery from './queries/CharacterStat.gql';
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
    name: string;
}

export default function UnitStatItem(props: Props) {
    const { name } = props;
    const [rarity, setRarity] = React.useState(3);
    const [rarityDraft, setRarityDraft] = React.useState(3);
    const [rank, setRank] = React.useState(10);
    const [rankDraft, setRankDraft] = React.useState('10');
    const [level, setLevel] = React.useState(107);
    const [levelDraft, setLevelDraft] = React.useState('107');
    const [equipmentFlags, setEquipmentFlags] = React.useState([false, false, false, false, false, false]);
    const [enhanceLevels, setEnhanceLevels] = React.useState([0, 0, 0, 0, 0, 0]);
    const [stat, setStat] = React.useState<Stat | null>(null);

    const handleRequery = React.useCallback(() => {
        setRarity(rarityDraft);
        setRank(Number(rankDraft));
        setRankDraft(String(Number(rankDraft)));
        setLevel(Number(levelDraft));
        setLevelDraft(String(Number(levelDraft)));
    }, [rarityDraft, rankDraft, levelDraft]);

    const handleEquipmentChange = React.useCallback((index: number, flag: boolean, enhanceLevel: number) => {
        setEquipmentFlags(equipmentFlags => {
            if (equipmentFlags[index] === flag) {
                return equipmentFlags;
            }
            const result = [...equipmentFlags];
            result[index] = flag;
            return result;
        });
        setEnhanceLevels(enhanceLevels => {
            if (enhanceLevels[index] === enhanceLevel) {
                return enhanceLevels;
            }
            const result = [...enhanceLevels];
            result[index] = enhanceLevel;
            return result;
        });
    }, []);

    const { loading, error, data } = useQuery<CharacterStatResult, CharacterStatVariables>(
        CharacterStatQuery,
        { variables: { name, rarity, rank } },
    );

    React.useEffect(
        () => {
            if (!loading && data && data.unit) {
                setStat(calculateFinalStat(data.unit, rank, level, equipmentFlags, enhanceLevels));
            }
        },
        [loading, data, rank, level, equipmentFlags, enhanceLevels],
    );

    if (error) {
        return null;
    }
    if (loading || data == null || stat == null) {
        return null;
    }

    const isDraft = rarity !== rarityDraft || String(rank) !== rankDraft || String(level) !== levelDraft;
    return (
        <UnitStatItemContainer>
            <Unit
                unit={data.unit}
                draft={isDraft}
                rarity={rarity}
                rarityDraft={rarityDraft}
                rankDraft={rankDraft}
                levelDraft={levelDraft}
                enhanceLevels={enhanceLevels}
                equipmentFlags={equipmentFlags}
                onRarityDraftChange={setRarityDraft}
                onRankDraftChange={setRankDraft}
                onLevelDraftChange={setLevelDraft}
                onApplyClick={handleRequery}
                onEquipmentChange={handleEquipmentChange}
            />
            <StatContainer>
                <Stats stat={stat} />
            </StatContainer>
        </UnitStatItemContainer>
    );
}
