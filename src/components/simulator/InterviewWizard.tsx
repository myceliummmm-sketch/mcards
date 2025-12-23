import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useInterviewWizard, SelectedPath } from '@/hooks/useInterviewWizard';
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

export function InterviewWizard() {
  const { step, data, actions } = useInterviewWizard();
  const [selectedPath, setSelectedPath] = useState<SelectedPath>('diy');

  const handlePathSelect = (path: SelectedPath) => {
    setSelectedPath(path);
    actions.selectPath(path);
  };

  const handleEmailComplete = () => {
    // Redirect to auth or dashboard
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col items-center justify-center py-12">
      <AnimatePresence mode="wait">
        {step === 'start' && (
          <StartStep key="start" onSelect={actions.selectBranch} />
        )}

        {step === 'project-name' && (
          <ProjectNameStep
            key="project-name"
            onNext={actions.nextFromProjectName}
            onBack={actions.goBack}
            initialValue={data.projectName}
          />
        )}

        {step === 'analogy' && (
          <AnalogyStep
            key="analogy"
            onSelect={actions.nextFromAnalogy}
            onBack={actions.goBack}
          />
        )}

        {step === 'niche' && data.analogyTemplate && (
          <NicheStep
            key="niche"
            template={data.analogyTemplate}
            onNext={actions.nextFromNiche}
            onBack={actions.goBack}
            initialValue={data.analogyNiche}
          />
        )}

        {step === 'audience' && (
          <AudienceStep
            key="audience"
            onNext={actions.nextFromAudience}
            onBack={actions.goBack}
            initialValue={data.targetAudience}
          />
        )}

        {step === 'pain-area' && (
          <PainAreaStep
            key="pain-area"
            onSelect={actions.nextFromPainArea}
            onBack={actions.goBack}
          />
        )}

        {step === 'pain-specific' && (
          <PainSpecificStep
            key="pain-specific"
            painArea={data.painArea}
            onSelect={actions.nextFromPainSpecific}
            onBack={actions.goBack}
          />
        )}

        {step === 'ai-ideas' && (
          <AIIdeasStep
            key="ai-ideas"
            painArea={data.painArea}
            specificPain={data.specificPain}
            onSelect={actions.selectAIIdea}
            onBack={actions.goBack}
            generatedIdeas={data.generatedIdeas}
            onIdeasGenerated={(ideas) => actions.updateData({ generatedIdeas: ideas })}
            regenerationCount={data.regenerationCount}
            onRegenerate={() => actions.updateData({ regenerationCount: data.regenerationCount + 1 })}
          />
        )}

        {step === 'motivation' && (
          <MotivationStep
            key="motivation"
            onSelect={actions.nextFromMotivation}
            onBack={actions.goBack}
          />
        )}

        {step === 'pain-story' && (
          <PainStoryStep
            key="pain-story"
            onNext={actions.nextFromPainStory}
            onSkip={() => actions.nextFromPainStory([])}
            onBack={actions.goBack}
            initialValue={data.painDetails}
          />
        )}

        {step === 'experience' && (
          <ExperienceStep
            key="experience"
            onNext={actions.nextFromExperience}
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
            onContinue={() => actions.goToStep('fork')}
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
