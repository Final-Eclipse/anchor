/**
 * Route names and their parameters. Part of the lane contract — if you need a
 * new route or a new param, say so in the group chat before changing this,
 * because Lane A's navigator and everyone's screens both depend on it.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NeedCategory, PathId } from '../data/types';

export type AppStackParamList = {
  Home: undefined;
  Assessment: undefined;
  /** Omit pathId to show the path she was last routed to. */
  Path: { pathId?: PathId } | undefined;
  /** Optionally opens pre-filtered, e.g. from a path step. */
  Directory: { filter?: NeedCategory } | undefined;
  Fund: undefined;
  Vault: undefined;
  AccountGuide: undefined;
  TrustedHelp: undefined;
  Inbox: undefined;
  SetupCheck: undefined;
};

export type ScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;
