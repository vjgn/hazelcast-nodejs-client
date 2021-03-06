package com.company.security;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DummyAuthenticator {
    private Map<String, String> users;
    private Map<String, List<String>> userGrous;

    public DummyAuthenticator(){
        userGrous = new HashMap<>();
        users = new HashMap<>();

        users.put("admin", "password1");
        users.put("reader", "password2");

        userGrous.put("admin", Arrays.asList("adminGroup"));
        userGrous.put("reader", Arrays.asList("readerGroup"));
    }

    public boolean authenticate(String username, String password){
        String userPassword = users.get(username);
        if (userPassword != null){
            return userPassword.equals(password);
        }
        return false;
    }

    public List<String> getRoles(String username){
        return userGrous.get(username);
    }
}
