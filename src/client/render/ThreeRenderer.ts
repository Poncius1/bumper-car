import * as THREE from 'three';

interface ThreeRendererOptions {
  readonly root: HTMLElement;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
}

export class ThreeRenderer {
  private readonly options: ThreeRendererOptions;
  private readonly renderer: THREE.WebGLRenderer;

  public constructor(options: ThreeRendererOptions) {
    this.options = options;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.options.root.replaceChildren(this.renderer.domElement);

    window.addEventListener('resize', this.handleResize);
  }

  public render(): void {
    this.renderer.render(this.options.scene, this.options.camera);
  }

  public dispose(): void {
    window.removeEventListener('resize', this.handleResize);

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private readonly handleResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.options.camera.aspect = width / height;
    this.options.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
}