import { gql } from 'apollo-boost';

import { CharacterUnit } from '../common-types';

import query from './queries/CharacterStat.gql';

export interface CharacterStatData {
    unit: CharacterUnit | null;
}

export default query;
