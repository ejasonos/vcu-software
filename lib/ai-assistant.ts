"use server"

import type { VCUState } from '@/store/vcu-store';
import OpenAI from 'openai';

type AssistantState = Partial<VCUState> & Record<string, unknown>;

function buildVCUStateContext(vcuState: AssistantState): string {
  const simulationData = (vcuState as Record<string, unknown>).data ?? vcuState;
  const data = simulationData as Record<string, unknown>;

  const stateSummary = {
    simulationRunning: vcuState.simulationRunning,
    failureMode: vcuState.failureMode,
    userThrottle: vcuState.userThrottle,
    userBrake: vcuState.userBrake,
    simulationSettings: vcuState.simulationSettings,
    simulationData: {
      batterySoc: data.batterySoc,
      batteryHealth: data.batteryHealth,
      batteryTemperature: data.batteryTemperature,
      motorSpeed: data.motorSpeed,
      motorTemperature: data.motorTemperature,
      throttlePosition: data.throttlePosition,
      brakePosition: data.brakePosition,
      vehicleSpeed: data.vehicleSpeed,
      chargingStatus: data.chargingStatus,
      faultStatus: data.faultStatus,
      systemStatus: data.systemStatus,
    },
    motorRunning: vcuState.motorRunning,
    faulted: vcuState.faulted,
    connected: vcuState.connected,
    operatingTime: vcuState.operatingTime,
    motorTemperature: vcuState.motorTemperature ?? data.motorTemperature,
    inverterTemperature: vcuState.inverterTemperature,
    requestedTorque: vcuState.requestedTorque,
    actualTorque: vcuState.actualTorque,
    maximumTorque: vcuState.maximumTorque,
    dcVoltage: vcuState.dcVoltage,
    batteryVoltage: vcuState.batteryVoltage ?? data.batteryVoltage,
    dcCurrent: vcuState.dcCurrent,
    power: vcuState.power,
    throttleLevel: vcuState.throttleLevel ?? data.throttlePosition,
    brakeLevel: vcuState.brakeLevel ?? data.brakePosition,
    rpm: vcuState.rpm ?? data.motorSpeed,
    maximumSpeed: vcuState.maximumSpeed,
    coolingFanState: vcuState.coolingFanState,
    mainContactorState: vcuState.mainContactorState,
    prechargeRelayState: vcuState.prechargeRelayState,
    logLevel: vcuState.logLevel,
    annunciators: vcuState.annunciators,
    healthScore: vcuState.healthScore,
    healthStatus: vcuState.healthStatus,
    prediction: vcuState.prediction,
    chatHistory: vcuState.chatHistory,
  };

  return `VCU state summary:\n${JSON.stringify(stateSummary, null, 2)}`;
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
});

export async function generateAIResponse(userMessage: string, vcuState: AssistantState): Promise<string> {
  const prompt = userMessage.trim();
  if (!prompt) {
    return 'Please ask a question about the vehicle system.';
  }

  const stateContext = buildVCUStateContext(vcuState);
  const messages = [
    {
      role: 'system' as const,
      content:
        'You are a concise EV control-unit assistant. Answer using markdown and only use the provided VCU state data. You may respond with a McKinsey-grade report given the context.',
    },
    {
      role: 'system' as const,
      content: stateContext,
    },
    {
      role: 'user' as const,
      content: prompt,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'meta/llama-3.2-11b-vision-instruct',
      messages,
      temperature: 0.2,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (content) {
      return content;
    }
  } catch (error) {
    console.error('OpenAI request failed', error);
  }

  return 'The assistant service could not return a response right now. Please try again.';
}

