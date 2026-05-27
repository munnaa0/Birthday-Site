import * as THREE from 'three';

export class Planet {
    constructor(scene, radius, position) {
        this.scene = scene;
        this.radius = radius;
        this.position = position;
        this.sunDirection = new THREE.Vector3(-1.0, 0.3, 0.5).normalize();
        this.pivot = new THREE.Object3D();
        this.pivot.position.copy(this.position);
        this.pivot.rotation.z = 0.35; 
        this.pivot.rotation.x = 0.15;
        this.scene.add(this.pivot);

        this.initSurface();
        this.initAtmosphere();
        this.initRings();
        this.initMoon();
    }
    static get noiseGLSL() {
        return `
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){ 
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
          i = mod(i, 289.0 ); 
          vec4 p = permute( permute( permute( 
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 1.0/7.0;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }
        
        float fbm(vec3 x) {
            float v = 0.0;
            float a = 0.5;
            vec3 shift = vec3(100.0);
            for (int i = 0; i < 6; ++i) {
                v += a * snoise(x);
                x = x * 2.0 + shift;
                a *= 0.5;
            }
            return v;
        }
        `;
    }

    initSurface() {
        const geometry = new THREE.SphereGeometry(this.radius, 128, 128);
        this.surfaceMat = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                lightDirection: { value: this.sunDirection }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                void main() {
                    vPosition = position;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 lightDirection;
                varying vec3 vPosition;
                varying vec3 vNormal;

                ${Planet.noiseGLSL}

                void main() {
                    vec3 norm = normalize(vNormal);
                    vec3 lightDir = normalize(lightDirection);
                    float diffuse = max(dot(norm, lightDir), 0.0);
                    float ambient = 0.01;
                    float terminator = smoothstep(-0.2, 0.2, dot(norm, lightDir));
                    float lighting = diffuse * terminator + ambient;
                    vec3 pos = normalize(vPosition);
                    float n1 = fbm(pos * 2.5 + vec3(time * 0.01));
                    float n2 = fbm(pos * 12.0 - vec3(time * 0.02));
                    float deformedY = pos.y + (n1 - 0.5) * 0.4 + (n2 - 0.5) * 0.1;
                    float bands = (sin(deformedY * 12.0) + 1.0) * 0.5;
                    float storm = fbm(pos * 4.0 + vec3(time * 0.04));
                    vec3 colorDeep = vec3(0.4, 0.05, 0.4);
                    vec3 colorMid = vec3(0.9, 0.3, 0.6);
                    vec3 colorHigh = vec3(1.0, 0.7, 0.75);
                    vec3 colorCloud = vec3(1.0, 0.95, 0.98);
                    vec3 surfaceColor = mix(colorDeep, colorMid, smoothstep(0.0, 0.3, bands));
                    surfaceColor = mix(surfaceColor, colorHigh, smoothstep(0.3, 0.7, bands));
                    surfaceColor = mix(surfaceColor, colorCloud, smoothstep(0.7, 1.0, bands));
                    float stormIntensity = smoothstep(0.6, 1.0, storm) * n1;
                    surfaceColor = mix(surfaceColor, vec3(1.0, 0.4, 0.8), stormIntensity);
                    vec3 finalColor = surfaceColor * lighting;

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
        });

        this.surfaceMesh = new THREE.Mesh(geometry, this.surfaceMat);
        this.pivot.add(this.surfaceMesh);
    }

    initAtmosphere() {
        const atmosphereGeo = new THREE.SphereGeometry(this.radius * 1.04, 64, 64);
        const atmosphereMat = new THREE.ShaderMaterial({
            uniforms: {
                lightDirection: { value: this.sunDirection }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 lightDirection;
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vec3 norm = normalize(vNormal);
                    vec3 lightDir = normalize(lightDirection);
                    float diffuse = smoothstep(-0.2, 0.6, dot(norm, lightDir));
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    float fresnel = dot(viewDir, norm);
                    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
                    fresnel = pow(fresnel, 5.0);
                    
                    float intensity = fresnel * diffuse * 2.0;
                    vec3 atmosphereColor = vec3(1.0, 0.4, 0.7); 
                    
                    gl_FragColor = vec4(atmosphereColor * intensity, intensity);
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true,
            depthWrite: false
        });
        
        this.atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
        this.pivot.add(this.atmosphereMesh);
    }

    initRings() {
        const inner = this.radius * 1.4;
        const outer = this.radius * 3.5;
        const ringGeo = new THREE.RingGeometry(inner, outer, 128);
        const posAttr = ringGeo.attributes.position;
        const v3 = new THREE.Vector3();
        for (let i = 0; i < posAttr.count; i++) {
            v3.fromBufferAttribute(posAttr, i);
            posAttr.setXYZ(i, v3.x, v3.z, v3.y);
        }

        const ringMat = new THREE.ShaderMaterial({
            uniforms: {
                innerRadius: { value: inner },
                outerRadius: { value: outer },
                lightDirection: { value: this.sunDirection }
            },
            vertexShader: `
                varying vec3 vPos;
                varying vec3 vNormal;
                void main() {
                    vPos = position;
                    vNormal = normalize(normalMatrix * vec3(0.0, 1.0, 0.0));
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float innerRadius;
                uniform float outerRadius;
                uniform vec3 lightDirection;
                varying vec3 vPos;
                varying vec3 vNormal;

                ${Planet.noiseGLSL}

                void main() {
                    float dist = length(vPos);
                    float uvDist = (dist - innerRadius) / (outerRadius - innerRadius);
                    float ringlets = fbm(vec3(dist * 6.0, 0.0, 0.0));
                    float alpha = smoothstep(0.3, 0.7, ringlets);
                    float gap1 = smoothstep(0.2, 0.22, uvDist) - smoothstep(0.25, 0.27, uvDist);
                    float gap2 = smoothstep(0.65, 0.67, uvDist) - smoothstep(0.72, 0.74, uvDist);
                    alpha *= clamp(1.0 - (gap1 + gap2), 0.0, 1.0);
                    alpha *= smoothstep(0.0, 0.05, uvDist) * (1.0 - smoothstep(0.95, 1.0, uvDist));
                    vec3 norm = normalize(vNormal);
                    vec3 lightDir = normalize(lightDirection);
                    float diffuse = abs(dot(norm, lightDir)) * 0.9 + 0.1; 
                    float planetShadow = 1.0;
                    float dotLightPos = dot(normalize(vPos), lightDir);
                    if (dotLightPos < 0.0) {
                        vec3 proj = vPos - lightDir * dot(vPos, lightDir);
                        float shadowDist = length(proj);
                        planetShadow = smoothstep(${this.radius.toFixed(1)} * 0.95, ${this.radius.toFixed(1)} * 1.05, shadowDist);
                        planetShadow = mix(0.05, 1.0, planetShadow);
                    }
                    vec3 color = vec3(0.9, 0.6, 0.7) * diffuse * planetShadow;
                    
                    gl_FragColor = vec4(color, alpha * 0.9);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
        this.pivot.add(this.ringMesh);
    }

    initMoon() {
        const moonRadius = this.radius * 0.15;
        const moonGeo = new THREE.SphereGeometry(moonRadius, 64, 64);
        const moonMat = new THREE.ShaderMaterial({
            uniforms: {
                lightDirection: { value: this.sunDirection }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                void main() {
                    vPosition = position;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 lightDirection;
                varying vec3 vPosition;
                varying vec3 vNormal;

                ${Planet.noiseGLSL}

                void main() {
                    vec3 norm = normalize(vNormal);
                    vec3 lightDir = normalize(lightDirection);
                    
                    float diffuse = max(dot(norm, lightDir), 0.0);
                    float terminator = smoothstep(-0.15, 0.15, dot(norm, lightDir));
                    float lighting = diffuse * terminator + 0.01;
                    vec3 pos = normalize(vPosition);
                    float craters = fbm(pos * 15.0);
                    craters = abs(craters - 0.5) * 2.0; 
                    
                    vec3 colorDark = vec3(0.12, 0.12, 0.15);
                    vec3 colorLight = vec3(0.45, 0.45, 0.5);
                    
                    vec3 moonColor = mix(colorDark, colorLight, craters);
                    
                    gl_FragColor = vec4(moonColor * lighting, 1.0);
                }
            `
        });

        this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
        
        this.moonOrbitPivot = new THREE.Object3D();
        this.moonMesh.position.set(this.radius * 4.5, this.radius * 0.5, 0);
        this.moonOrbitPivot.add(this.moonMesh);
        
        this.pivot.add(this.moonOrbitPivot);
    }

    update(time) {
        this.surfaceMat.uniforms.time.value = time;
        this.surfaceMesh.rotation.y = time * 0.03;
        if (this.moonOrbitPivot) {
            this.moonOrbitPivot.rotation.y = time * -0.15;
            this.moonOrbitPivot.rotation.z = 0.05; 
        }
        
        if (this.moonMesh) {
            this.moonMesh.rotation.y = time * 0.2;
        }
        if (this.ringMesh) {
            this.ringMesh.rotation.y = time * 0.01;
        }
        const orbitRadius = 150;
        const orbitSpeed = 0.01;
        this.pivot.position.x = Math.cos(time * orbitSpeed) * orbitRadius;
        this.pivot.position.z = Math.sin(time * orbitSpeed) * orbitRadius - 100;
    }
}