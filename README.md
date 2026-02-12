# EV Vehicle Control Unit (VCU) - Fault Prediction and Data Visualization

This application is designed to visualize and predict potential faults in the **Electric Vehicle (EV)** control unit (VCU) by reading real-time datasets. The data includes key metrics such as voltage, current, velocity, acceleration, temperature, and voltage per battery pack. By utilizing AI-driven predictions, the app helps in identifying potential issues before they escalate, ensuring the safety and performance of the EV.

## Features

- **Data Visualization**: View real-time datasets for voltage, current, velocity, acceleration, temperature, and battery pack voltage in dynamic charts and graphs.
- **Fault Prediction**: AI-powered predictions for potential faults in the EV's VCU, based on data analysis.
- **Real-Time Updates**: Continuously update data for monitoring vehicle performance and health.
- **Fault Alerts**: Receive alerts on possible faults, such as abnormal temperature, voltage, or other key parameters.

## Tech Stack

- **Frontend**:  
  - React.js for building the user interface.
  - Zustand for state management to handle global app state and data.
  - Tailwind CSS for responsive and modern UI design.
  - React Router DOM for navigation between different pages and data visualizations.

- **Backend** (optional for dataset fetching and AI models):
  - APIs for fetching real-time data (voltage, current, temperature, etc.).
  - AI-powered fault prediction system (e.g., trained ML models) integrated with backend services.

## Installation

To run this project locally, follow these steps:

1. Clone this repository:

   ```bash
   git clone https://github.com/ejasonos/vcu-software.git

2. Use pnpm not npm

   ```bash
   cd vcu-software
   pnpm install
   pnpm run dev
