/*
 * Represents TTL DataStore Server.
 */
package dippertask.ttlserver;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 *
 * @author adityajain
 */
public class TTLServer {
    
    private static final TTLServerConfig config;
    private static final DataStore store = new TTLDataStore();
    private static final ThreadPoolExecutor threadPool;
    
    static {
        config = new TTLServerConfig();
        threadPool = new ThreadPoolExecutor(
                (int)config.getConfig(TTLServerConfig.CORE_THREAD_POOL_SIZE),
                (int)config.getConfig(TTLServerConfig.MAX_THREAD_POOL_SIZE),
                (long)config.getConfig(TTLServerConfig.KEEP_ALIVE_TIME),
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<>()
        );
    }
    
    public static void main(String[] args) throws IOException {
        ServerSocket server = new ServerSocket((Integer)config.getConfig(TTLServerConfig.SERVER_PORT));
        System.out.println("TTL DataStore Server started at port : " + config.getConfig(TTLServerConfig.SERVER_PORT));
        
        while(true){
            Socket socket = server.accept();
            threadPool.execute(new TTLRequestHandlerTask(socket, store));
        }
    }
}
