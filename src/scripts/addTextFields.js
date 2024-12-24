"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var firebase_1 = require("../config/firebase");
var firestore_1 = require("firebase/firestore");
var addTextFields = function () { return __awaiter(void 0, void 0, void 0, function () {
    var categoriesRef, q, querySnapshot, generalCategory, fieldsRef, currentDate, existingFieldsSnapshot, existingFields, textFieldsToAdd, _loop_1, _i, textFieldsToAdd_1, field, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                categoriesRef = (0, firestore_1.collection)(firebase_1.db, 'categories');
                q = (0, firestore_1.query)(categoriesRef, (0, firestore_1.where)('name', '==', 'Général'));
                return [4 /*yield*/, (0, firestore_1.getDocs)(q)];
            case 1:
                querySnapshot = _a.sent();
                if (querySnapshot.empty) {
                    console.error('Catégorie "Général" non trouvée');
                    return [2 /*return*/];
                }
                generalCategory = querySnapshot.docs[0];
                fieldsRef = (0, firestore_1.collection)(firebase_1.db, 'fields');
                currentDate = new Date().toISOString();
                return [4 /*yield*/, (0, firestore_1.getDocs)(fieldsRef)];
            case 2:
                existingFieldsSnapshot = _a.sent();
                existingFields = existingFieldsSnapshot.docs.map(function (doc) { return (__assign({ id: doc.id }, doc.data())); });
                textFieldsToAdd = [
                    {
                        type: 'field',
                        text: 'Traitement dentiste',
                        fieldType: 'textarea',
                        required: false,
                        order: existingFields.length + 1,
                        categoryId: generalCategory.id,
                        createdAt: currentDate,
                        updatedAt: currentDate
                    },
                    {
                        type: 'field',
                        text: 'Motif',
                        fieldType: 'textarea',
                        required: false,
                        order: existingFields.length + 2,
                        categoryId: generalCategory.id,
                        createdAt: currentDate,
                        updatedAt: currentDate
                    }
                ];
                _loop_1 = function (field) {
                    var exists;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                exists = existingFields.some(function (ef) {
                                    return ef.text === field.text &&
                                        ef.type === field.type &&
                                        ef.fieldType === field.fieldType;
                                });
                                if (!!exists) return [3 /*break*/, 2];
                                return [4 /*yield*/, (0, firestore_1.addDoc)(fieldsRef, field)];
                            case 1:
                                _b.sent();
                                console.log("Champ \"".concat(field.text, "\" ajout\u00E9 avec succ\u00E8s"));
                                return [3 /*break*/, 3];
                            case 2:
                                console.log("Champ \"".concat(field.text, "\" existe d\u00E9j\u00E0, ignor\u00E9"));
                                _b.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, textFieldsToAdd_1 = textFieldsToAdd;
                _a.label = 3;
            case 3:
                if (!(_i < textFieldsToAdd_1.length)) return [3 /*break*/, 6];
                field = textFieldsToAdd_1[_i];
                return [5 /*yield**/, _loop_1(field)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6:
                console.log('Tous les champs ont été traités avec succès');
                return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                console.error('Erreur lors de l\'ajout des champs:', error_1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
// Exécuter le script
addTextFields();
