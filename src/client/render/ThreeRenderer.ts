import * as THREE from 'three';

interface ThreeRendererOptions {
  readonly root: HTMLElement;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
}

export class ThreeRenderer {
  private readonly options: ThreeRendererOptions;
  private readonly renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

  public constructor(options: ThreeRendererOptions) {
    this.options = options;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.options.root.replaceChildren(this.renderer.domElement);

    window.addEventListener('resize', this.handleResize);
  }

  public start(): void {
    if (this.animationFrameId !== null) {
      return;
    }

    this.renderFrame();
  }

  public dispose(): void {
    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    window.removeEventListener('resize', this.handleResize);

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private readonly renderFrame = (): void => {
    this.renderer.render(this.options.scene, this.options.camera);

    this.animationFrameId = window.requestAnimationFrame(this.renderFrame);
  };

  private readonly handleResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.options.camera.aspect = width / height;
    this.options.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
}