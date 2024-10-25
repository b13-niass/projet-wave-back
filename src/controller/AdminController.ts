import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
import Decimal from 'decimal.js';

import {Response} from 'express';
import {ControllerRequest} from "../interface/Interface.js";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class adminController{

    constructor() {
        for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
            const val = (this as any)[key];
            if (key !== 'constructor' && typeof val === 'function') {
                (this as any)[key] = val.bind(this);
            }
        }
    }


}

export default new adminController();