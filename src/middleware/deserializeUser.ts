import { get } from "lodash";
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.utils";
import { reIssueAccessToken } from "../service/session.service";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken =
    // get(req, "cookies.accessToken") ||
    get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    ""
  );

  const refreshToken: any =  get(req, "cookies.refreshToken") || get(req, "headers.x-refresh") ;

  if (!accessToken) {
    return next();
  }

  // const { decoded, expired } = verifyJwt(accessToken, "accessTokenPublicKey");
  const { decoded, expired } = verifyJwt(accessToken);
  // console.log("decoded",decoded)
 
  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  if (expired && refreshToken) {
    const newAccessToken = await reIssueAccessToken ({ refreshToken });

    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);

      // res.cookie("accessToken",  newAccessToken, {
      //   maxAge: 900000, //15 mins
      //   httpOnly: true,
      //   domain: 'localhost',
      //   path: '/',
      //   sameSite: 'strict',
      //   secure: false, //true in production
      // });
    }

    // const result = verifyJwt(newAccessToken as string, "accessTokenPublicKey");
    const result = verifyJwt(newAccessToken as string);

    res.locals.user = result.decoded;
    return next();
  }

  return next();
};

export default deserializeUser;