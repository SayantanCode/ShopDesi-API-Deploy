const statusCode = {
    SUCCESS: 200,
    CREATED: 201,
    UPDATED: 202,
    DELETED: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500
};
export var Status;
(function (Status) {
    Status["SUCCESS"] = "SUCCESS";
    Status["CREATED"] = "CREATED";
    Status["UPDATED"] = "UPDATED";
    Status["DELETED"] = "DELETED";
    Status["BAD_REQUEST"] = "BAD_REQUEST";
    Status["UNAUTHORIZED"] = "UNAUTHORIZED";
    Status["NOT_FOUND"] = "NOT_FOUND";
    Status["CONFLICT"] = "CONFLICT";
    Status["SERVER_ERROR"] = "SERVER_ERROR";
})(Status || (Status = {}));
const defaultMessage = {
    SUCCESS: "Data fetched successfully",
    CREATED: "Data Created Successfully",
    UPDATED: "Data Updated Successfully",
    DELETED: "Data Deleted Successfully",
    BAD_REQUEST: "Please fill all the required fields",
    UNAUTHORIZED: "Unauthorized",
    NOT_FOUND: "Not Found",
    CONFLICT: "Data Already Exists",
    SERVER_ERROR: "Server Error"
};
export const response = ({ status = Status.SUCCESS, forTerm, customMessage, data, success }) => {
    const statusCodeValue = statusCode[status];
    if (!statusCodeValue) {
        return {
            status: statusCode.SERVER_ERROR,
            message: defaultMessage.SERVER_ERROR,
            errorReason: "Invalid status code"
        };
    }
    const message = customMessage ? customMessage : forTerm ? forTerm + defaultMessage[status] : defaultMessage[status];
    if (statusCodeValue >= 400) {
        return {
            status: statusCodeValue,
            success: success || false,
            message
        };
    }
    return {
        status: statusCodeValue,
        success: success || true,
        message,
        data
    };
};
