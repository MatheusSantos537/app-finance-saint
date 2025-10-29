 

import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeProvider'; // 1. Importe o SEU hook

export const DashboardResumo = () => {
  // 2. Chame o hook para pegar o tema ATIVO (claro ou escuro)
  const { colors, spacing } = useTheme();

  // 3. Use os valores do tema no seu estilo!
  return (
    <View style={{ 
      backgroundColor: colors.card, // Cor do card (claro ou escuro)
      padding: spacing.m,           // Espaçamento padrão
      borderRadius: 8
    }}>
      <Text style={{ 
        color: colors.textSecondary,  // Cor de texto secundária
        fontSize: 14 
      }}>
        Saldo da Família
      </Text>
      
      <Text style={{ 
        color: colors.primary, // Sua cor verde principal!
        fontSize: 24, 
        fontWeight: 'bold',
        marginTop: spacing.s
      }}>
        R$ 9.101,50
      </Text>
    </View>
  );
};