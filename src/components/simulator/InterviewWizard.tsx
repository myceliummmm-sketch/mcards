import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useInterviewWizard, SelectedPath, Branch, AnalogyTemplate, AIIdea, Motivation } from '@/hooks/useInterviewWizard';
import { StartStep } from './steps/StartStep';
import { ProjectNameStep } from './steps/ProjectNameStep';
import { AnalogyStep } from './steps/AnalogyStep';
import { NicheStep } from './steps/NicheStep';
import { AudienceStep } from './steps/AudienceStep';
import { PainAreaStep } from './steps/PainAreaStep';
import { PainSpecificStep } from './steps/PainSpecificStep';
import { AIIdeasStep } from './steps/AIIdeasStep';
import { MotivationStep } from './steps/MotivationStep';
import { PainStoryStep } from './steps/PainStoryStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { GeneratingStep } from './steps/GeneratingStep';
import { VideoStep } from './steps/VideoStep';
import { RevealStep } from './steps/RevealStep';
import { CardRevealStep } from './steps/CardRevealStep';
import { ForkStep } from './steps/ForkStep';
import { EmailStep } from './steps/EmailStep';

interface InterviewWizardProps {
  trackEvent?: (eventName: string, data?: Record<string, unknown>) => void;
}

export function InterviewWizard({ trackEvent }: InterviewWizardProps) {
  const { step, data, actions } = useInterviewWizard();
  const [selectedPath, setSelectedPath] = useState<SelectedPath>('diy');

  // Track step changes
  useEffect(() => {
    if (step !== 'start') {
      trackEvent?.('interview_step_view', { step, branch: data.branch });
    }
  }, [step, data.branch, trackEvent]);

  const handleBranchSelect = (branch: Branch) => {
    trackEvent?.('interview_start', { branch });
    actions.selectBranch(branch);
  };

  const handleProjectName = (name: string) => {
    trackEvent?.('interview_step_complete', { step: 'project-name', projectName: name });
    actions.nextFromProjectName(name);
  };

  const handleAnalogy = (template: AnalogyTemplate) => {
    trackEvent?.('interview_step_complete', { step: 'analogy', template });
    actions.nextFromAnalogy(template);
  };

  const handleNiche = (niche: string) => {
    trackEvent?.('interview_step_complete', { step: 'niche', niche });
    actions.nextFromNiche(niche);
  };

  const handleAudience = (audience: string[]) => {
    trackEvent?.('interview_step_complete', { step: 'audience', audienceCount: audience.length });
    actions.nextFromAudience(audience);
  };

  const handlePainArea = (area: string) => {
    trackEvent?.('interview_step_complete', { step: 'pain-area', painArea: area });
    actions.nextFromPainArea(area);
  };

  const handlePainSpecific = (pain: string) => {
    trackEvent?.('interview_step_complete', { step: 'pain-specific', specificPain: pain });
    actions.nextFromPainSpecific(pain);
  };

  const handleIdeasGenerated = (ideas: AIIdea[]) => {
    trackEvent?.('interview_ai_ideas_generated', { count: ideas.length });
    actions.updateData({ generatedIdeas: ideas });
  };

  const handleIdeaSelect = (idea: AIIdea) => {
    trackEvent?.('interview_idea_selected', { ideaName: idea.name });
    actions.selectAIIdea(idea);
  };

  const handleMotivation = (motivation: Motivation) => {
    trackEvent?.('interview_step_complete', { step: 'motivation', motivation });
    actions.nextFromMotivation(motivation);
  };

  const handlePainStory = (details: string[]) => {
    trackEvent?.('interview_step_complete', { step: 'pain-story', detailsCount: details.length });
    actions.nextFromPainStory(details);
  };

  const handleExperience = (experience: string[]) => {
    trackEvent?.('interview_step_complete', { step: 'experience', experience });
    actions.nextFromExperience(experience);
  };

  const handleCardReveal = () => {
    trackEvent?.('interview_card_generated', { 
      rarity: data.cardRarity, 
      founderFitScore: data.founderFitScore 
    });
    actions.goToStep('fork');
  };

  const handlePathSelect = (path: SelectedPath) => {
    trackEvent?.('interview_path_selected', { path });
    setSelectedPath(path);
    actions.selectPath(path);
  };

  const handleEmailComplete = () => {
    trackEvent?.('interview_email_submitted', { 
      path: selectedPath,
      branch: data.branch,
      rarity: data.cardRarity,
      founderFitScore: data.founderFitScore
    });
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col items-center justify-center py-12">
      <AnimatePresence mode="wait">
        {step === 'start' && (
          <StartStep key="start" onSelect={handleBranchSelect} />
        )}

        {step === 'project-name' && (
          <ProjectNameStep
            key="project-name"
            onNext={handleProjectName}
            onBack={actions.goBack}
            initialValue={data.projectName}
          />
        )}

        {step === 'analogy' && (
          <AnalogyStep
            key="analogy"
            onSelect={handleAnalogy}
            onBack={actions.goBack}
          />
        )}

        {step === 'niche' && data.analogyTemplate && (
          <NicheStep
            key="niche"
            template={data.analogyTemplate}
            onNext={handleNiche}
            onBack={actions.goBack}
            initialValue={data.analogyNiche}
          />
        )}

        {step === 'audience' && (
          <AudienceStep
            key="audience"
            onNext={handleAudience}
            onBack={actions.goBack}
            initialValue={data.targetAudience}
          />
        )}

        {step === 'pain-area' && (
          <PainAreaStep
            key="pain-area"
            onSelect={handlePainArea}
            onBack={actions.goBack}
          />
        )}

        {step === 'pain-specific' && (
          <PainSpecificStep
            key="pain-specific"
            painArea={data.painArea}
            onSelect={handlePainSpecific}
            onBack={actions.goBack}
          />
        )}

        {step === 'ai-ideas' && (
          <AIIdeasStep
            key="ai-ideas"
            painArea={data.painArea}
            specificPain={data.specificPain}
            onSelect={handleIdeaSelect}
            onBack={actions.goBack}
            generatedIdeas={data.generatedIdeas}
            onIdeasGenerated={handleIdeasGenerated}
            regenerationCount={data.regenerationCount}
            onRegenerate={() => actions.updateData({ regenerationCount: data.regenerationCount + 1 })}
          />
        )}

        {step === 'motivation' && (
          <MotivationStep
            key="motivation"
            onSelect={handleMotivation}
            onBack={actions.goBack}
          />
        )}

        {step === 'pain-story' && (
          <PainStoryStep
            key="pain-story"
            onNext={handlePainStory}
            onSkip={() => handlePainStory([])}
            onBack={actions.goBack}
            initialValue={data.painDetails}
          />
        )}

        {step === 'experience' && (
          <ExperienceStep
            key="experience"
            onNext={handleExperience}
            onBack={actions.goBack}
            initialValue={data.experience}
          />
        )}

        {step === 'generating' && (
          <GeneratingStep key="generating" onComplete={actions.finishGenerating} />
        )}

        {step === 'video' && (
          <VideoStep key="video" onComplete={actions.finishVideo} />
        )}

        {step === 'reveal' && (
          <RevealStep key="reveal" onComplete={actions.finishReveal} />
        )}

        {step === 'card' && (
          <CardRevealStep
            key="card"
            data={data}
            onContinue={handleCardReveal}
            onEdit={() => actions.goToStep('project-name')}
          />
        )}

        {step === 'fork' && (
          <ForkStep key="fork" onSelect={handlePathSelect} />
        )}
      </AnimatePresence>

      {step === 'email' && (
        <EmailStep
          data={data}
          selectedPath={selectedPath}
          onComplete={handleEmailComplete}
        />
      )}
    </div>
  );
}
