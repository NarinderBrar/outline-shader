precision highp  float;

uniform sampler2D textureSampler;
uniform sampler2D depthTexture;

uniform vec2 resolution;

uniform vec3 outlineColor;
uniform float outlineWidth;

varying vec2 vUV;

void main() {
    vec2 invRes = 1.0 / resolution;

    vec4 mainColor = texture2D(textureSampler, vUV);

    vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invRes, invRes);
    vec4 nbCxyF = texture2D(depthTexture, vUV + uvOffset.xy);
    vec4 nbCxyB = texture2D(depthTexture, vUV - uvOffset.xy);
    vec4 nbCywF = texture2D(depthTexture, vUV + uvOffset.yw);
    vec4 nbCywB = texture2D(depthTexture, vUV - uvOffset.yw);

    float diffxy = nbCxyF.r - nbCxyB.r;
    float diffyw = nbCywF.r - nbCywB.r;
    
    float diffLen = length(vec2(diffxy, diffyw));

    vec4 col = vec4(outlineColor, 1.0) * vec4(diffLen);
    gl_FragColor = mix(mainColor, col, smoothstep(0.0, 0.01, diffLen));
}
