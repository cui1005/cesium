import {
  PostProcessStage,
  PostProcessStageCollection,
  Tonemapper,
} from "../../index.js";

import createScene from "../../../../Specs/createScene.js";
import ViewportPrimitive from "../../../../Specs/ViewportPrimitive.js";

describe(
  "Scene/PostProcessStageCollection",
  function () {
    let scene;

    beforeAll(function () {
      scene = createScene();
      scene.postProcessStages.fxaa.enabled = false;
    });

    afterAll(function () {
      scene.destroyForSpecs();
    });

    afterEach(function () {
      scene.postProcessStages.removeAll();
      scene.postProcessStages.fxaa.enabled = false;
      scene.postProcessStages.bloom.enabled = false;
      scene.postProcessStages.ambientOcclusion.enabled = false;
      scene.highDynamicRange = false;
      scene.primitives.removeAll();
    });

    it("constructs", function () {
      const stages = new PostProcessStageCollection();
      expect(stages.ready).toEqual(false);
      expect(stages.fxaa).toBeDefined();
      expect(stages.ambientOcclusion).toBeDefined();
      expect(stages.bloom).toBeDefined();
      expect(stages.length).toEqual(0);
      expect(stages.outputTexture).not.toBeDefined();
    });

    it("adds stages", function () {
      expect(scene).toRender([0, 0, 0, 255]);

      scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 1.0, 0.0, 1.0); }",
        })
      );
      expect(scene.postProcessStages.length).toEqual(1);

      scene.renderForSpecs();
      expect(scene).toRender([255, 255, 0, 255]);

      scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "uniform sampler2D colorTexture;\n" +
            "in vec2 v_textureCoordinates;\n" +
            "void main() {\n" +
            "    vec4 color = texture(colorTexture, v_textureCoordinates);\n" +
            "    out_FragColor = vec4(color.r, 0.0, 1.0, 1.0);\n" +
            "}",
        })
      );
      expect(scene.postProcessStages.length).toEqual(2);

      scene.renderForSpecs();
      expect(scene).toRender([255, 0, 255, 255]);
    });

    it("throws when adding the same stage", function () {
      const stage = new PostProcessStage({
        fragmentShader:
          "void main() { out_FragColor = vec4(1.0, 1.0, 0.0, 1.0); }",
      });
      expect(function () {
        scene.postProcessStages.add(stage);
        scene.postProcessStages.add(stage);
      }).toThrowDeveloperError();
    });

    it("removes a single stage", function () {
      const stage1 = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 1.0, 0.0, 1.0); }",
        })
      );
      scene.renderForSpecs();
      expect(scene).toRender([255, 255, 0, 255]);

      scene.postProcessStages.remove(stage1);
      scene.renderForSpecs();
      expect(scene).toRender([0, 0, 0, 255]);
    });

    it("removes stages", function () {
      expect(scene).toRender([0, 0, 0, 255]);

      const stage1 = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 1.0, 0.0, 1.0); }",
        })
      );
      const stage2 = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "uniform sampler2D colorTexture;\n" +
            "in vec2 v_textureCoordinates;\n" +
            "void main() {\n" +
            "    vec4 color = texture(colorTexture, v_textureCoordinates);\n" +
            "    out_FragColor = vec4(color.r, 0.0, 1.0, 1.0);\n" +
            "}",
        })
      );
      expect(scene.postProcessStages.length).toEqual(2);

      scene.renderForSpecs();
      expect(scene).toRender([255, 0, 255, 255]);

      scene.postProcessStages.remove(stage1);
      expect(scene.postProcessStages.length).toEqual(1);
      expect(scene.postProcessStages.contains(stage1)).toEqual(false);
      expect(scene.postProcessStages.contains(stage2)).toEqual(true);
      expect(stage1.isDestroyed()).toEqual(true);

      scene.renderForSpecs();
      expect(scene).toRender([0, 0, 255, 255]);

      scene.postProcessStages.remove(stage2);
      expect(scene.postProcessStages.length).toEqual(0);
      expect(scene.postProcessStages.contains(stage2)).toEqual(false);
      expect(stage2.isDestroyed()).toEqual(true);

      scene.renderForSpecs();
      expect(scene).toRender([0, 0, 0, 255]);

      expect(scene.postProcessStages.remove(stage1)).toEqual(false);
    });

    it("gets stages at index", function () {
      const stage1 = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 1.0, 0.0, 1.0); }",
        })
      );
      const stage2 = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "uniform sampler2D colorTexture;\n" +
            "in vec2 v_textureCoordinates;\n" +
            "void main() {\n" +
            "    vec4 color = texture(colorTexture, v_textureCoordinates);\n" +
            "    out_FragColor = vec4(color.r, 0.0, 1.0, 1.0);\n" +
            "}",
        })
      );
      expect(scene.postProcessStages.length).toEqual(2);

      expect(scene.postProcessStages.get(0)).toEqual(stage1);
      expect(scene.postProcessStages.get(1)).toEqual(stage2);
      expect(scene.postProcessStages.remove(stage1)).toEqual(true);
      expect(scene.postProcessStages.get(0)).toEqual(stage2);
    });

    it("throws when get index is invalid", function () {
      expect(function () {
        return scene.postProcessStages.get(0);
      }).toThrowDeveloperError();

      scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 1.0, 0.0, 1.0); }",
        })
      );
      expect(function () {
        return scene.postProcessStages.get(-1);
      }).toThrowDeveloperError();
      expect(function () {
        return scene.postProcessStages.get(1);
      }).toThrowDeveloperError();
    });

    it("removes all", function () {
      expect(scene).toRender([0, 0, 0, 255]);

      const stage1 = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 1.0, 0.0, 1.0); }",
        })
      );
      const stage2 = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "uniform sampler2D colorTexture;\n" +
            "in vec2 v_textureCoordinates;\n" +
            "void main() {\n" +
            "    vec4 color = texture(colorTexture, v_textureCoordinates);\n" +
            "    out_FragColor = vec4(color.r, 0.0, 1.0, 1.0);\n" +
            "}",
        })
      );
      expect(scene.postProcessStages.length).toEqual(2);

      scene.renderForSpecs();
      expect(scene).toRender([255, 0, 255, 255]);

      scene.postProcessStages.removeAll();
      expect(scene.postProcessStages.length).toEqual(0);
      expect(scene.postProcessStages.contains(stage1)).toEqual(false);
      expect(scene.postProcessStages.contains(stage2)).toEqual(false);
      expect(stage1.isDestroyed()).toEqual(true);
      expect(stage2.isDestroyed()).toEqual(true);

      scene.renderForSpecs();
      expect(scene).toRender([0, 0, 0, 255]);

      expect(scene.postProcessStages.remove(stage1)).toEqual(false);
    });

    it("gets by stage name", function () {
      const stage1 = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 1.0, 0.0, 1.0); }",
        })
      );
      const stage2 = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "uniform sampler2D colorTexture;\n" +
            "in vec2 v_textureCoordinates;\n" +
            "void main() {\n" +
            "    vec4 color = texture(colorTexture, v_textureCoordinates);\n" +
            "    out_FragColor = vec4(color.r, 0.0, 1.0, 1.0);\n" +
            "}",
        })
      );

      expect(scene.postProcessStages.getStageByName(stage1.name)).toEqual(
        stage1
      );
      expect(scene.postProcessStages.getStageByName(stage2.name)).toEqual(
        stage2
      );
      expect(
        scene.postProcessStages.getStageByName("invalid")
      ).not.toBeDefined();
    });

    it("gets the output texture by stage name", function () {
      const stage1 = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 1.0, 0.0, 1.0); }",
        })
      );
      const stage2 = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "uniform sampler2D colorTexture;\n" +
            "in vec2 v_textureCoordinates;\n" +
            "void main() {\n" +
            "    vec4 color = texture(colorTexture, v_textureCoordinates);\n" +
            "    out_FragColor = vec4(color.r, 0.0, 1.0, 1.0);\n" +
            "}",
        })
      );
      scene.postProcessStages.fxaa.enabled = true;

      scene.renderForSpecs();

      expect(
        scene.postProcessStages.getOutputTexture(stage1.name)
      ).toBeDefined();
      expect(
        scene.postProcessStages.getOutputTexture(stage2.name)
      ).toBeDefined();
      expect(
        scene.postProcessStages.getOutputTexture(
          scene.postProcessStages.fxaa.name
        )
      ).toBeDefined();
      expect(
        scene.postProcessStages.getOutputTexture(
          scene.postProcessStages.fxaa.name
        )
      ).toEqual(scene.postProcessStages.getOutputTexture(stage1.name));

      scene.postProcessStages.remove(stage1);
      expect(
        scene.postProcessStages.getOutputTexture(stage1.name)
      ).not.toBeDefined();
    });

    it("shows correct output when single stage is enabled then disabled", function () {
      const stage = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 0.0, 1.0, 1.0); }",
        })
      );
      scene.renderForSpecs();
      expect(scene).toRender([255, 0, 255, 255]);

      stage.enabled = false;

      scene.renderForSpecs();
      expect(scene).toRender([0, 0, 0, 255]);
    });

    it("shows correct output when single stage is disabled then enabled", function () {
      const stage = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 0.0, 1.0, 1.0); }",
        })
      );
      stage.enabled = false;

      scene.renderForSpecs();
      expect(scene).toRender([0, 0, 0, 255]);

      stage.enabled = true;

      scene.renderForSpecs();
      expect(scene).toRender([255, 0, 255, 255]);
    });

    it("shows correct output when additional stage is enabled then disabled", function () {
      scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 0.0, 1.0, 1.0); }",
        })
      );
      const stage = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(0.0, 1.0, 1.0, 1.0); }",
        })
      );

      scene.renderForSpecs();
      expect(scene).toRender([0, 255, 255, 255]);

      stage.enabled = false;

      scene.renderForSpecs();
      expect(scene).toRender([255, 0, 255, 255]);
    });

    it("shows correct output when additional stage is disabled then enabled", function () {
      scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(1.0, 0.0, 1.0, 1.0); }",
        })
      );
      const stage = scene.postProcessStages.add(
        new PostProcessStage({
          fragmentShader:
            "void main() { out_FragColor = vec4(0.0, 1.0, 1.0, 1.0); }",
        })
      );
      stage.enabled = false;

      scene.renderForSpecs();
      expect(scene).toRender([255, 0, 255, 255]);

      stage.enabled = true;

      scene.renderForSpecs();
      expect(scene).toRender([0, 255, 255, 255]);
    });

    describe("HDR tonemapping", () => {
      const black = [0, 0, 0, 255];

      it("uses Reinhard tonemapping", function () {
        if (!scene.highDynamicRangeSupported) {
          return;
        }

        const fs =
          "void main() { \n" +
          "    out_FragColor = vec4(4.0, 0.0, 0.0, 1.0); \n" +
          "} \n";
        scene.primitives.add(new ViewportPrimitive(fs));

        scene.postProcessStages.tonemapper = Tonemapper.REINHARD;

        const colorWithoutHdr = [255, 0, 0, 255];

        expect(scene).toRender(colorWithoutHdr);
        scene.highDynamicRange = true;
        expect(scene).toRenderAndCall(function (rgba) {
          expect(rgba).not.toEqual(black);
          expect(rgba).not.toEqual(colorWithoutHdr);
          expect(rgba[0]).withContext("r").toBeGreaterThan(0);
          expect(rgba[1]).withContext("g").toEqual(0);
          expect(rgba[2]).withContext("b").toEqual(0);
          expect(rgba[3]).withContext("a").toEqual(255);
        });
        scene.highDynamicRange = false;
      });

      it("uses modified Reinhard tonemapping", function () {
        if (!scene.highDynamicRangeSupported) {
          return;
        }

        const fs =
          "void main() { \n" +
          "    out_FragColor = vec4(0.5, 0.0, 0.0, 1.0); \n" +
          "} \n";
        scene.primitives.add(new ViewportPrimitive(fs));

        scene.postProcessStages.tonemapper = Tonemapper.MODIFIED_REINHARD;

        const colorWithoutHdr = [127, 0, 0, 255];

        // expect(scene).toRenderAndCall(function (rgba) {
        //   expect(rgba).toEqualEpsilon(colorWithoutHdr, 5);
        // });
        expect(scene).toRender(colorWithoutHdr);
        scene.highDynamicRange = true;
        expect(scene).toRenderAndCall(function (rgba) {
          expect(rgba).not.toEqual(black);
          expect(rgba).not.toEqual(colorWithoutHdr);
          expect(rgba[0]).withContext("r").toBeGreaterThan(0);
          expect(rgba[1]).withContext("g").toEqual(0);
          expect(rgba[2]).withContext("b").toEqual(0);
          expect(rgba[3]).withContext("a").toEqual(255);
        });
        scene.highDynamicRange = false;
      });

      it("uses filmic tonemapping", function () {
        if (!scene.highDynamicRangeSupported) {
          return;
        }

        const fs =
          "void main() { \n" +
          "    out_FragColor = vec4(4.0, 0.0, 0.0, 1.0); \n" +
          "} \n";
        scene.primitives.add(new ViewportPrimitive(fs));

        scene.postProcessStages.tonemapper = Tonemapper.FILMIC;

        const colorWithoutHdr = [255, 0, 0, 255];

        expect(scene).toRender(colorWithoutHdr);
        scene.highDynamicRange = true;
        expect(scene).toRenderAndCall(function (rgba) {
          expect(rgba).not.toEqual(black);
          expect(rgba).not.toEqual(colorWithoutHdr);
          expect(rgba[0]).withContext("r").toBeGreaterThan(0);
          expect(rgba[1]).withContext("g").toEqual(0);
          expect(rgba[2]).withContext("b").toEqual(0);
          expect(rgba[3]).withContext("a").toEqual(255);
        });
        scene.highDynamicRange = false;
      });

      it("uses ACES tonemapping", function () {
        if (!scene.highDynamicRangeSupported) {
          return;
        }

        const fs =
          "void main() { \n" +
          "    out_FragColor = vec4(4.0, 0.0, 0.0, 1.0); \n" +
          "} \n";
        scene.primitives.add(new ViewportPrimitive(fs));

        scene.postProcessStages.tonemapper = Tonemapper.ACES;

        const colorWithoutHdr = [255, 0, 0, 255];

        expect(scene).toRender(colorWithoutHdr);
        scene.highDynamicRange = true;
        expect(scene).toRenderAndCall(function (rgba) {
          expect(rgba).not.toEqual(black);
          expect(rgba).not.toEqual(colorWithoutHdr);
          expect(rgba[0]).withContext("r").toBeGreaterThan(0);
          expect(rgba[1]).withContext("g").toEqual(0);
          expect(rgba[2]).withContext("b").toEqual(0);
          expect(rgba[3]).withContext("a").toEqual(255);
        });
        scene.highDynamicRange = false;
      });

      it("uses PBR Neutral tonemapping", function () {
        if (!scene.highDynamicRangeSupported) {
          return;
        }

        const fs =
          "void main() { \n" +
          "    out_FragColor = vec4(4.0, 0.0, 0.0, 1.0); \n" +
          "} \n";
        scene.primitives.add(new ViewportPrimitive(fs));

        scene.postProcessStages.tonemapper = Tonemapper.PBR_NEUTRAL;

        const colorWithoutHdr = [255, 0, 0, 255];
        expect(scene).toRender(colorWithoutHdr);
        scene.highDynamicRange = true;
        expect(scene).toRenderAndCall(function (rgba) {
          expect(rgba).not.toEqual(black);
          expect(rgba).not.toEqual(colorWithoutHdr);
          expect(rgba[0]).withContext("r").toBeGreaterThan(0);
          // TODO: I'm not 100% sure how to verify this. The other tests only modify the red channel...
          expect(rgba[0]).withContext("r").toEqual(253);
          expect(rgba[1]).withContext("g").toEqual(149);
          expect(rgba[2]).withContext("b").toEqual(149);
          expect(rgba[3]).withContext("a").toEqual(255);
        });
        scene.highDynamicRange = false;
      });
    });

    it("destroys", function () {
      const stages = new PostProcessStageCollection();
      const stage = stages.add(
        new PostProcessStage({
          fragmentShader: "void main() { out_FragColor = vec4(1.0); }",
        })
      );
      expect(stages.isDestroyed()).toEqual(false);
      stages.destroy();
      expect(stages.isDestroyed()).toEqual(true);
      expect(stage.isDestroyed()).toEqual(true);
    });
  },
  "WebGL"
);
