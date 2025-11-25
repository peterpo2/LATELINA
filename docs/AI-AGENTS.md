# AI Agents Playbook

## Overview
AIPharm+ ships with an OpenAI-powered assistant that answers medical questions and guides users through the storefront. This document explains how the existing integration works and how to launch additional automation agents for development or support workflows.

## Existing assistant
- **Endpoint:** `AIPharm.Backend/AIPharm.Web` exposes the chat API that the React widget calls.
- **Context:** The backend seeds medical products and uses them to ground the assistant answers.
- **Rate limits:** All requests flow through your OpenAI API key. Monitor usage in the OpenAI dashboard and set soft limits to avoid unexpected costs.

## Launching a development agent (Начален промпт)
1. Confirm your local `.env` includes `OpenAI__ApiKey` so the backend can route messages.
2. Use the following starter prompts when bootstrapping a development-focused agent:
   - **English:** `Act as the AIPharm+ development co-pilot. Before writing code, list the affected UI routes, check the current release version (0.1.0), and outline a step-by-step plan with test coverage ideas.`
   - **Български:** `Действай като AIPharm+ агент за разработка. Провери текущата версия (0.1.0), изброи засегнатите страници и предложи план за имплементация и тестове.`
3. Always ask the agent to verify feature toggles via the `FeatureToggleContext` and to check the latest changelog.

## Safety checklist
- **PII handling:** Never store personal health information in prompts or logs. Redact customer details before forwarding requests to OpenAI.
- **Medical disclaimer:** The assistant must remind users to consult a licensed physician for diagnosis or prescriptions.
- **Audit trail:** Log the user ID, question, and model response in secure storage if you plan to use the chat in production.

## Extending the ecosystem
- Add queue workers that process pharmacy orders by calling the backend once the agent validates prescriptions.
- Configure alerting (PagerDuty, email) when the agent encounters repeated API failures or exceeds cost thresholds.
- Explore caching agent responses with Redis if you introduce FAQs or repeated troubleshooting steps.

For deeper architectural context review [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) and the main [README](../README.md) release notes.
