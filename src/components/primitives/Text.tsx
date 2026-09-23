import { Text as RNText } from 'react-native';
import type { TextComponent } from '../../types/screen';
import { mapStyle } from '../mapStyle';

export function Text({ content, style }: TextComponent) {
  return <RNText style={mapStyle(style)}>{content}</RNText>;
}
