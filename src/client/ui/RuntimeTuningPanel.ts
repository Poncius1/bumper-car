import type {
  RuntimeCameraTuning,
  RuntimeCarTuning,
  RuntimeTuning,
} from '../debug/RuntimeTuning';

type RuntimeCarTuningKey = keyof RuntimeCarTuning;
type RuntimeCameraTuningKey = keyof RuntimeCameraTuning;

interface CarSliderDefinition {
  readonly label: string;
  readonly key: RuntimeCarTuningKey;
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

interface CameraSliderDefinition {
  readonly label: string;
  readonly key: RuntimeCameraTuningKey;
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

const CAR_SLIDERS: readonly CarSliderDefinition[] = [
  { label: 'Acceleration', key: 'acceleration', min: 1, max: 40, step: 0.5 },
  {
    label: 'Reverse Accel',
    key: 'reverseAcceleration',
    min: 1,
    max: 30,
    step: 0.5,
  },
  {
    label: 'Brake Decel',
    key: 'brakeDeceleration',
    min: 1,
    max: 50,
    step: 0.5,
  },
  { label: 'Drag', key: 'drag', min: 0, max: 20, step: 0.25 },
  {
    label: 'Max Speed',
    key: 'maxForwardSpeed',
    min: 1,
    max: 30,
    step: 0.5,
  },
  {
    label: 'Reverse Speed',
    key: 'maxReverseSpeed',
    min: 1,
    max: 15,
    step: 0.5,
  },
  { label: 'Turn Speed', key: 'turnSpeed', min: 0.5, max: 12, step: 0.1 },
  { label: 'Boost Mult', key: 'boostMultiplier', min: 1, max: 5, step: 0.05 },
];

const CAMERA_SLIDERS: readonly CameraSliderDefinition[] = [
  { label: 'Distance', key: 'distance', min: 2, max: 20, step: 0.25 },
  { label: 'Height', key: 'height', min: 1, max: 15, step: 0.25 },
  {
    label: 'Look Height',
    key: 'lookAtHeight',
    min: 0,
    max: 5,
    step: 0.1,
  },
  {
    label: 'Pos Smooth',
    key: 'positionSmoothing',
    min: 1,
    max: 40,
    step: 0.5,
  },
  {
    label: 'Look Smooth',
    key: 'lookAtSmoothing',
    min: 1,
    max: 40,
    step: 0.5,
  },
];

export class RuntimeTuningPanel {
  private readonly root: HTMLDivElement;
  private readonly tuning: RuntimeTuning;
  private isCollapsed = false;

  public constructor(parent: HTMLElement, tuning: RuntimeTuning) {
    this.tuning = tuning;

    this.root = document.createElement('div');
    this.root.className = 'runtime-tuning-panel';

    parent.appendChild(this.root);

    this.render();
  }

  public dispose(): void {
    this.root.remove();
  }

  private render(): void {
    this.root.innerHTML = '';

    const header = document.createElement('header');
    header.className = 'runtime-tuning-panel__header';

    const title = document.createElement('strong');
    title.textContent = 'Runtime Tuning';

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.textContent = this.isCollapsed ? 'Show' : 'Hide';
    toggleButton.addEventListener('click', () => {
      this.isCollapsed = !this.isCollapsed;
      this.render();
    });

    header.append(title, toggleButton);
    this.root.append(header);

    if (this.isCollapsed) {
      return;
    }

    this.root.append(
      this.createCarSliderGroup(),
      this.createCameraSliderGroup(),
    );
  }

  private createCarSliderGroup(): HTMLElement {
    const section = createSection('Car Controller');

    for (const slider of CAR_SLIDERS) {
      section.append(createCarSlider(this.tuning.car, slider));
    }

    return section;
  }

  private createCameraSliderGroup(): HTMLElement {
    const section = createSection('Camera');

    for (const slider of CAMERA_SLIDERS) {
      section.append(createCameraSlider(this.tuning.camera, slider));
    }

    return section;
  }
}

function createSection(title: string): HTMLElement {
  const section = document.createElement('section');
  section.className = 'runtime-tuning-panel__section';

  const heading = document.createElement('h2');
  heading.textContent = title;

  section.append(heading);

  return section;
}

function createCarSlider(
  target: RuntimeCarTuning,
  definition: CarSliderDefinition,
): HTMLElement {
  const row = document.createElement('label');
  row.className = 'runtime-tuning-panel__row';

  const name = document.createElement('span');
  name.textContent = definition.label;

  const value = document.createElement('output');
  value.textContent = target[definition.key].toFixed(2);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(definition.min);
  input.max = String(definition.max);
  input.step = String(definition.step);
  input.value = String(target[definition.key]);

  input.addEventListener('input', () => {
    const nextValue = Number(input.value);

    target[definition.key] = nextValue;
    value.textContent = nextValue.toFixed(2);
  });

  row.append(name, input, value);

  return row;
}

function createCameraSlider(
  target: RuntimeCameraTuning,
  definition: CameraSliderDefinition,
): HTMLElement {
  const row = document.createElement('label');
  row.className = 'runtime-tuning-panel__row';

  const name = document.createElement('span');
  name.textContent = definition.label;

  const value = document.createElement('output');
  value.textContent = target[definition.key].toFixed(2);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(definition.min);
  input.max = String(definition.max);
  input.step = String(definition.step);
  input.value = String(target[definition.key]);

  input.addEventListener('input', () => {
    const nextValue = Number(input.value);

    target[definition.key] = nextValue;
    value.textContent = nextValue.toFixed(2);
  });

  row.append(name, input, value);

  return row;
}