/**
 * handles GET /api/request
 */
package dippertask.httpserver.api;

import dippertask.commons.Message;
import dippertask.commons.TTLServerCommand;
import dippertask.httpserver.HttpRequest;
import dippertask.httpserver.api.commons.Constants;
import dippertask.httpserver.util.HttpResponseGenerator;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.net.Socket;
import java.util.concurrent.TimeUnit;
/**
 *
 * @author adityajain
 */
public class RequestUrlHandler implements UrlHandler{

    @Override
    public void handleRequest(HttpRequest request){
        try(Socket dataStoreCon = new Socket(Constants.TTLServer.HOST_NAME, Constants.TTLServer.PORT_NO)) {
            ObjectOutputStream out = new ObjectOutputStream(dataStoreCon.getOutputStream());
            ObjectInputStream in = new ObjectInputStream(dataStoreCon.getInputStream());
            
            Integer connId = Integer.valueOf(request.getRequestParam("connId"));
            Integer timeout = Integer.valueOf(request.getRequestParam("timeout"));
            
            String response = "";
            Message message = new Message(TTLServerCommand.SET, connId, timeout);
            out.writeObject(message);
            in.readObject();
            message = new Message(TTLServerCommand.CONTAINS, connId, null);
            while(true) {
                try {
                    TimeUnit.SECONDS.sleep(1);
                    out.writeObject(message);
                    response = (String)in.readObject();
                    if(!response.equals("1")) {
                        break;
                    }
                } catch(Exception ex) {
                    break;
                }
            }
            
            response = (response.equals("-1")) ? "{\"status\":\"kill\"}" : "{\"status\":\"ok\"}";
            request.getOutputStream().write(HttpResponseGenerator.success(response));
        } catch(Exception e) {
            throw new RuntimeException("Error while handling request" + e);
        }
    }
}
