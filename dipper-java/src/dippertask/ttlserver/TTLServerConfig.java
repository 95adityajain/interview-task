/*
 * Represents TTL DataStore server Configuration object.
 */
package dippertask.ttlserver;

import java.util.HashMap;

/**
 *
 * @author adityajain
 */
public class TTLServerConfig {
    
    public static final String CORE_THREAD_POOL_SIZE = "c_th_sz";
    public static final String MAX_THREAD_POOL_SIZE = "m_th_sz";
    public static final String KEEP_ALIVE_TIME = "k_al_tm";
    public static final String SERVER_PORT = "s_p";
    
    private final HashMap<String, Object> serverConfig = getConfigurations();
    
    private HashMap<String, Object> getConfigurations(){
        HashMap<String, Object> config = new HashMap<>();
        config.put(MAX_THREAD_POOL_SIZE, 1000);
        config.put(CORE_THREAD_POOL_SIZE, 500);
        config.put(KEEP_ALIVE_TIME, 10l);//10 in long.
        config.put(SERVER_PORT, 3131);
        return config;
    }
    
    public Object getConfig(String configName) {
        return (serverConfig.containsKey(configName)) ? serverConfig.get(configName) : null;
    }
}
