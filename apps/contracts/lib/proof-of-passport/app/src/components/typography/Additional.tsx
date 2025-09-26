// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import React from 'react';
import type { TextProps } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import { shouldShowAesopRedesign } from '@/hooks/useAesopRedesign';
import { slate400 } from '@/utils/colors';
import { dinot } from '@/utils/fonts';

type AdditionalProps = TextProps;

const Additional = ({ children, style, ...props }: AdditionalProps) => {
  return (
    <Text {...props} style={[styles.additional, style]}>
      {children}
    </Text>
  );
};

export default Additional;

const styles = StyleSheet.create({
  additional: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    color: slate400,
    marginTop: 10,
    fontFamily: dinot,
    textTransform: 'none',
    ...(shouldShowAesopRedesign() && {
      fontSize: 11.5,
      textTransform: 'uppercase',
    }),
  },
});
