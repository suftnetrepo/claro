import { useColors } from "@/constants";
import { Stack } from "fluent-styles";
import { useWindowDimensions } from "react-native";

function RowDivider() {
  const Colors = useColors();
  const width = useWindowDimensions().width;
  return (
    <Stack
      horizontal
      width={width - 66 - 16}
      height={1}
      flex={1}
      backgroundColor={Colors.border}
      marginLeft={66}
      opacity={0.6}
    />
  );
}

export  {RowDivider};