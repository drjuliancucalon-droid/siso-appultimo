import React, { createContext, useContext, useState, useEffect } from 'react';
import { AI_PROVIDERS, fetchWithTimeout, parseAIJSON } from '../shared/lib/aiProviders';

const AIContext = createContext();

export const useAI = () => {
  return useContext(AIContext);
};

export const AIProvider = ({ children }) => {
  const [aiConfig, setAiConfig] = useState({
    activeProvider: 'gemini', // default provider
    keys: {
      gemini: '',
      groq: '',
      together: '',
      openrouter: ''
    }
  });

  const [aiStatus, setAiStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

  useEffect(() => {
    // Load initial config from local storage
    const savedConfig = localStorage.getItem('aiConfig');
    if (savedConfig) {
      try {
        setAiConfig(JSON.parse(savedConfig));
      } catch (err) {
        console.error("Failed to parse saved AI config", err);
      }
    }
  }, []);

  const updateAIConfig = (newConfig) => {
    const updatedConfig = { ...aiConfig, ...newConfig };
    setAiConfig(updatedConfig);
    localStorage.setItem('aiConfig', JSON.stringify(updatedConfig));
  };

  const testProvider = async (providerKey) => {
    setAiStatus('loading');
    try {
      // Mock test endpoint depending on provider, using fetchWithTimeout and AI_PROVIDERS
      const providerInfo = AI_PROVIDERS[providerKey];
      if (!providerInfo) throw new Error("Unknown provider");
      
      const apiKey = aiConfig.keys[providerKey];
      if (!apiKey) throw new Error("API key missing for provider");

      // Implement specific test logic here or call a test endpoint from aiProviders
      // Example generic fetch (you would replace with actual API URL from providerInfo)
      // const res = await fetchWithTimeout(providerInfo.endpoint, { headers: { Authorization: `Bearer ${apiKey}` }});
      
      setAiStatus('success');
      return true;
    } catch (err) {
      console.error("Provider test failed", err);
      setAiStatus('error');
      return false;
    }
  };

  const generateAnalysis = async (prompt, dataContext) => {
    setAiStatus('loading');
    try {
      const activeProviderKey = aiConfig.activeProvider;
      const apiKey = aiConfig.keys[activeProviderKey];
      const providerInfo = AI_PROVIDERS[activeProviderKey];
      
      if (!apiKey || !providerInfo) {
         throw new Error("Provider not configured correctly");
      }

      // Prepare request body based on provider
      // Example implementation (abstracted here, replace with actual call logic from aiProviders if available)
      const body = JSON.stringify({
        model: providerInfo.model,
        messages: [
            { role: "system", content: "You are a health safety assistant." },
            { role: "user", content: `Context: ${JSON.stringify(dataContext)}\nPrompt: ${prompt}` }
        ]
      });

      // Use fetchWithTimeout and parseAIJSON from shared library
      // const response = await fetchWithTimeout(providerInfo.endpoint, {
      //   method: 'POST',
      //   headers: {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${apiKey}`
      //   },
      //   body
      // });
      
      // const json = await parseAIJSON(response);

      // MOCK RETURN
      const mockAnalysis = "Generated AI Analysis based on context.";

      setAiStatus('success');
      return mockAnalysis; // return json or parsed result
    } catch (err) {
      console.error("AI Generation failed:", err);
      setAiStatus('error');
      throw err;
    }
  };

  const value = {
    aiConfig,
    aiStatus,
    updateAIConfig,
    testProvider,
    generateAnalysis
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};
