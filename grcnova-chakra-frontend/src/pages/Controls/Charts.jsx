// src/pages/Controls/Charts.jsx
import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useColorModeValue } from '@chakra-ui/react';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const PieChart = ({ data }) => {
  const textColor = useColorModeValue('#1A202C', '#E2E8F0');
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textColor }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}%`
        }
      }
    }
  };

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [{
      label: 'Compliance Percentage',
      data: data.map(item => Math.round((item.iso + item.soc2 + item.hipaa) / 3)),
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(139, 92, 246, 0.7)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <div style={{ height: '300px' }}>
      <Pie 
        data={chartData} 
        options={{
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            title: {
              display: true,
              text: 'Average Compliance by Category',
              color: textColor,
              font: { size: 16 }
            }
          }
        }} 
      />
    </div>
  );
};

export const BarChart = ({ data }) => {
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textColor }
      }
    }
  };

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [{
      label: 'Implementation Progress',
      data: data.map(item => Math.round((item.implemented / item.total) * 100)),
      backgroundColor: data.map(item => item.color),
      borderColor: data.map(item => item.color.replace('0.7', '1')),
      borderWidth: 1
    }]
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar 
        data={chartData} 
        options={{
          ...chartOptions,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { color: textColor },
              grid: { color: gridColor }
            },
            x: {
              ticks: { color: textColor },
              grid: { color: gridColor }
            }
          },
          plugins: {
            ...chartOptions.plugins,
            title: {
              display: true,
              text: 'Framework Implementation',
              color: textColor,
              font: { size: 16 }
            }
          }
        }} 
      />
    </div>
  );
};