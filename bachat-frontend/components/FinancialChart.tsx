import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Palette } from '@/constants/Colors';
import { ChartDataPoint } from '@/context/LedgerContext';

interface FinancialChartProps {
  incomeData: ChartDataPoint[];
  expenseData: ChartDataPoint[];
  title?: string;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({
  incomeData,
  expenseData,
  title = 'Cash Flow Dynamics',
}) => {
  const screenWidth = Dimensions.get('window').width;

  // Interleave income & expense data for grouped comparison bars
  const barData: any[] = [];
  const count = Math.min(incomeData.length, expenseData.length);

  for (let i = 0; i < count; i++) {
    const inc = incomeData[i];
    const exp = expenseData[i];

    barData.push({
      value: inc.value,
      label: inc.label,
      spacing: 4,
      labelWidth: 34,
      labelTextStyle: { color: '#64748B', fontSize: 10, fontWeight: '600' },
      frontColor: Palette.emerald,
      gradientColor: '#059669',
    });

    barData.push({
      value: exp.value,
      frontColor: Palette.rose,
      gradientColor: '#B91C1C',
    });
  }

  const maxValue = Math.max(
    ...incomeData.map(d => d.value),
    ...expenseData.map(d => d.value),
    1000
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Inflow vs Outflow Comparison</Text>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Palette.emerald }]} />
            <Text style={styles.legendText}>Inflow</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Palette.rose }]} />
            <Text style={styles.legendText}>Outflow</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <BarChart
          data={barData}
          barWidth={14}
          initialSpacing={12}
          spacing={16}
          barBorderRadius={3}
          noOfSections={4}
          maxValue={maxValue * 1.15}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#1E293B"
          yAxisTextStyle={{ color: '#64748B', fontSize: 9 }}
          isAnimated
          animationDuration={300}
          height={150}
          width={screenWidth - 80}
          hideRules={false}
          rulesColor="rgba(255, 255, 255, 0.04)"
          formatYLabel={(val: string) => {
            const num = parseFloat(val);
            if (num >= 1000) return `${Math.round(num / 1000)}k`;
            return `${Math.round(num)}`;
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.cardDark,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Palette.borderDark,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    overflow: 'hidden',
  },
});
