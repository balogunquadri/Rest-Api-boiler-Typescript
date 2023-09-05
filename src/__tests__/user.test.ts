import mongoose from "mongoose";
import supertest from "supertest";
import createServer  from "../utils/server";
import * as UserService from '../service/user.service'
import * as SessionService from '../service/session.service'
import { createUserSessionHandler } from "../controller/session.controller";

const app = createServer()
const userId = new mongoose.Types.ObjectId().toString();

export const userPayload = {
    _id: userId,
    email: "jane.doe@example.com",
    name: "Jane Doe",
  };

const userInput = {
     email: "test@example.com",
     name: "Jane Doe",
    password: "Password123",
    passwordConfirmation: "Password123",
};
  
const sessionPayload = {
    _id: new mongoose.Types.ObjectId().toString(),
    user: userId,
   valid: true,
    userAgent: "PostmanRuntime/7.28.4",
    createdAt: new Date('2023-09-04T13:31:07.674Z'),
    updatededAt: new Date('2023-09-04T13:31:07.674Z'),
    __v: 0,
 };


describe('user', () => {

    //User Registration

    describe('user registration', () => {
        describe('username and password is valid', () => {
            it('should return the user payload', async () => {
                const createUserServiceMock = jest
                    .spyOn(UserService, "createUser")

                    //@ts-ignore
                    .mockReturnValueOnce(userPayload);

                
                const { statusCode, body } = await supertest(app)
                    .post('/api/users')
                    .send(userInput)

                expect(statusCode).toBe(200);
                expect(body).toEqual(userPayload);

                expect(createUserServiceMock).toHaveBeenCalledWith(userInput)
            })
        })

        describe('password does not match', () => {
            it('should return 400', async () => {

                const createUserServiceMock = jest
                    .spyOn(UserService, "createUser")

                    //@ts-ignore
                    .mockReturnValueOnce(userPayload);

            
                const { statusCode } = await supertest(app)
                    .post('/api/users')
                    .send({ ...userInput, passwordConfirmation: 'doesnotmatch' });

                expect(statusCode).toBe(400);
                (expect(createUserServiceMock).not.toHaveBeenCalled
                )

            })
        })

        describe('given the user service throws an error', () => {
            it('should return 409', async () => {
                const createUserServiceMock = jest
                    .spyOn(UserService, "createUser")

                    //@ts-ignore
                    .mockRejectedValue("error tfound");

            
                const { statusCode } = await supertest(app)
                    .post('/api/users')
                    .send(userInput);

                expect(statusCode).toBe(409);
                expect(createUserServiceMock).toHaveBeenCalled()
            })
        })
        


        describe('create user session', () => {
            //Create a user session
            //Login with valid email and password

            describe('username and password are valid', () => {
                it('should return a signed accessToken & refresh token', async() => {
                    jest.spyOn(UserService, "validatePassword")
                       //@ts-ignore
                        .mockReturnValue(userPayload)
                    

                    
                    jest.spyOn(SessionService, "createSession")
                        //@ts-ignore
                        .mockReturnValue(sessionPayload)

                    const req = {
                        get: () => {
                            return "User Agent"
                        },
                        body: {
                            email: "test@example.com",
                            password: "Password123"
                        },
                    };
                    const send = jest.fn();
                    
                    const res = {
                        send
                    }

                    //@ts-ignore
                    await createUserSessionHandler(req, res)

                    expect(send).toHaveBeenCalledWith({
                        accessToken: expect.any(String),
                        refreshToken: expect.any(String),
})
                });
     
            });
            
        });
    });
});