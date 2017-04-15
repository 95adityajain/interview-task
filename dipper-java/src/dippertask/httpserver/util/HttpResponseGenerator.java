/*
 * Helper class to generate http responses.
 */
package dippertask.httpserver.util;

import java.io.UnsupportedEncodingException;
/**
 *
 * @author adityajain
 */
public class HttpResponseGenerator {
    private static final String ENCODING = "UTF-8";
    public static byte[] success() throws UnsupportedEncodingException {
        return "HTTP/1.0 200 OK\r\n".getBytes(ENCODING);
    }
    
    public static byte[] success(String payload) throws UnsupportedEncodingException {
        return ("HTTP/1.0 200 OK\r\n\r\n" + payload).getBytes(ENCODING);
    }
    
    public static byte[] notFound() throws UnsupportedEncodingException {
        return "HTTP/1.0 404 Not Found\r\n".getBytes(ENCODING);
    }
    
    public static byte[] badRequest() throws UnsupportedEncodingException {
        return "HTTP/1.0 400 Bad Request\r\n".getBytes(ENCODING);
    }
    
    public static byte[] internalServerError() throws UnsupportedEncodingException {
        return "HTTP/1.0 500 Internal Server Error\r\n".getBytes(ENCODING);
    }
}
