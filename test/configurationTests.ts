/*
 * Copyright 2016 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from "fs";
import {IConfigurationFile, extendConfigurationFile, loadConfigurationFromPath} from "../src/configuration";

describe("Configuration", () => {
    it("extendConfigurationFile", () => {
        const EMPTY_CONFIG: IConfigurationFile = {
            rules: {},
            rulesDirectory: [],
        };

        assert.deepEqual(extendConfigurationFile({}, {}), EMPTY_CONFIG);
        assert.deepEqual(extendConfigurationFile({}, EMPTY_CONFIG), EMPTY_CONFIG);
        assert.deepEqual(extendConfigurationFile(EMPTY_CONFIG, {}), EMPTY_CONFIG);
        assert.deepEqual(extendConfigurationFile({}, {rules: {foo: "bar"}, rulesDirectory: "foo"}), {
            rules: {foo: "bar"},
            rulesDirectory: ["foo"],
        });
        assert.deepEqual(extendConfigurationFile({
            rules: {
                "a": 1,
                "b": 2,
            },
            rulesDirectory: ["foo", "bar"],
        }, {
            rules: {
                "b": 1,
                "c": 3,
            },
            rulesDirectory: "baz",
        }), {
            rules: {
                "a": 1,
                "b": 2,
                "c": 3,
            },
            rulesDirectory: ["foo", "bar", "baz"],
        });
    });

    describe("loadConfigurationFromPath", () => {
        it("extends with relative path", () => {
            let config = loadConfigurationFromPath("./test/config/tslint-extends-relative.json");

            assert.isArray(config.rulesDirectory);
            assert.isTrue(config.rules["no-fail"]);
            assert.isFalse(config.rules["always-fail"]);
        });

        it("extends with package", () => {
            let config = loadConfigurationFromPath("./test/config/tslint-extends-package.json");

            assert.isArray(config.rulesDirectory);
            assert.deepEqual(config.rules, {
                "rule-one": true,
                "rule-two": true,
                "rule-three": false,
            });
        });

        it("extends with package without customization", () => {
            let config = loadConfigurationFromPath("./test/config/tslint-extends-package-no-mod.json");

            assert.isArray(config.rulesDirectory);
            assert.deepEqual(config.rules, {
                "rule-one": true,
                "rule-two": false,
            });
        });

        it("extends with package two levels (and relative path in rulesDirectory)", () => {
            let config = loadConfigurationFromPath("./test/config/tslint-extends-package-two-levels.json");

            assert.isArray(config.rulesDirectory);
            assert.lengthOf(config.rulesDirectory, 2);
            assert.isTrue(fs.existsSync(config.rulesDirectory[0]));
            assert.isTrue(fs.existsSync(config.rulesDirectory[1]));
            assert.deepEqual(config.rules, {
                "always-fail": false,
                "rule-one": true,
                "rule-two": true,
                "rule-four": true,
            });
        });

        it("extends with array", () => {
            let config = loadConfigurationFromPath("./test/config/tslint-extends-package-array.json");

            assert.isArray(config.rulesDirectory);
            assert.deepEqual(config.rules, {
                "always-fail": false,
                "no-fail": true,
                "rule-one": true,
                "rule-two": false,
            });
        });

        it("can load .json files with comments", () => {
            const config = loadConfigurationFromPath("./test/config/tslint-with-comments.json");

            assert.deepEqual(config.rules, {
                "rule-two": true,
                "rule-three": "//not a comment",
                "rule-four": "/*also not a comment*/",
            });
        });
    });
});
